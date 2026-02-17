import SignatureBox from '@/components/shared/SignatureBox';
import { RadioInputType } from '@/components/shared/small/DynamicField';
import TextField from '@/components/shared/small/TextField';
import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { Autocomplete } from '@react-google-maps/api';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const IdMissionDataPdf = ({ formId, sectionKey, formInnerData, setFormInnerData }) => {
  const { data: form } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const idMissionSection = form?.data?.sections?.find(sec => sec?.title?.toLowerCase() == 'id_verification_blk');
  const { isDisabledAllFields } = useSelector(state => state.form);
  const autocompleteRef = useRef(null);


  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");
      if (file) {
        const oldSign = formInnerData?.[sectionKey]?.["signature"];
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error("File Not Deleted Please Try Again");
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error("File Not Uploaded Please Try Again");
        }
        setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], signature: res } }));
        toast.success("Signature uploaded successfully");
      }
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };
  const onLoad = (autocompleteInstance) => {
    autocompleteRef.current = autocompleteInstance;
  };
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;

    if (!place.address_components?.length && place.place_id) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: place.place_id }, (results, status) => {
        if (status === 'OK' && results?.length) {
          handleGeocodeResults(results);
        } else {
          handlePlace(place);
        }
      });
      return;
    }

    handlePlace(place);

    const hasPostal = (place.address_components || []).some((c) => c.types.includes('postal_code'));

    if (!hasPostal && place.geometry?.location) {
      reverseGeocode(place.geometry.location.lat(), place.geometry.location.lng());
    }
  };
  const handlePlace = (place) => {
    const components = place.address_components || [];
    const geometry = place.geometry;
    const parsed = parseComponents(components, geometry);

    setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], ...parsed } }));
  };
  const handleGeocodeResults = (results) => {
    const parsed = parseComponentsFromResults(results);
    setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], ...parsed } }));
  };
  const parseComponents = (components = [], geometry) => {
    const find = (types) => {
      const t = Array.isArray(types) ? types : [types];
      return components.find((c) => t.some((x) => c.types.includes(x)));
    };

    const getLong = (types) => find(types)?.long_name || '';
    const getShort = (types) => find(types)?.short_name || '';

    const streetNumber = getLong('street_number');
    const route = getLong('route');
    const subpremise = getLong('subpremise');
    const premise = getLong('premise');

    const city =
      getLong('locality') ||
      getLong('postal_town') ||
      getLong('administrative_area_level_3') ||
      getLong('administrative_area_level_2') ||
      getLong(['sublocality', 'sublocality_level_1']) ||
      '';

    const stateShort = getShort('administrative_area_level_1');
    const stateLong = getLong('administrative_area_level_1');

    const postal = getLong('postal_code');
    const postalSuffix = getLong('postal_code_suffix');
    const zipCode = postalSuffix ? `${postal}-${postalSuffix}` : postal;

    const country = getLong('country');

    const streetAddress = [premise, streetNumber, route, subpremise]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      streetAddress: streetAddress,
      city,
      state: stateShort || stateLong,
      country,
      zipCode,
      lat: geometry?.location?.lat?.() ?? null,
      lng: geometry?.location?.lng?.() ?? null,
    };
  };
  const parseComponentsFromResults = (results) => {
    let city = '';
    let state = '';
    let postal = '';
    let suffix = '';
    let country = '';
    let lat, lng;
    let streetAddress = '';

    for (const result of results) {
      const comps = result.address_components || [];

      const find = (types) => {
        const t = Array.isArray(types) ? types : [types];
        return comps.find((c) => t.some((x) => c.types.includes(x)));
      };

      if (!city) {
        city =
          find('locality')?.long_name ||
          find('postal_town')?.long_name ||
          find('administrative_area_level_3')?.long_name ||
          find('administrative_area_level_2')?.long_name ||
          '';
      }

      if (!state) {
        const s = find('administrative_area_level_1');
        if (s) state = s.short_name || s.long_name;
      }

      if (!postal) {
        const p = find('postal_code');
        if (p) postal = p.long_name;
      }

      if (!suffix) {
        const s = find('postal_code_suffix');
        if (s) suffix = s.long_name;
      }

      if (!country) {
        const c = find('country');
        if (c) country = c.long_name;
      }

      if (!lat && result.geometry?.location) {
        lat = result.geometry.location.lat();
        lng = result.geometry.location.lng();
      }

      if (!streetAddress) {
        const sn = find('street_number')?.long_name || '';
        const rt = find('route')?.long_name || '';
        const pm = find('premise')?.long_name || '';
        const sp = find('subpremise')?.long_name || '';

        const assembled = [pm, sn, rt, sp].filter(Boolean).join(' ').trim();
        if (assembled) streetAddress = assembled;
      }

      if (city && state && postal && country) break;
    }

    const zipCode = suffix ? `${postal}-${suffix}` : postal;

    return {
      streetAddress,
      city,
      state,
      country,
      zipCode,
      lat,
      lng,
    };
  };
  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== 'OK' || !results?.length) return;

      const parsed = parseComponentsFromResults(results);

      setFormInnerData(prev => ({
        ...prev, [sectionKey]:
        {
          ...prev?.[sectionKey],
          streetAddress: parsed.streetAddress,
          city: parsed.city,
          state: parsed.state,
          country: parsed.country,
          zipCode: parsed.zipCode,
          lat: parsed.lat ?? prev?.[sectionKey]?.lat,
          lng: parsed.lng ?? prev?.[sectionKey]?.lng
        }
      }));
    });
  };

  return (
    <div className="flex w-full flex-col p-2">
      {form?.data?.idMissionDataDisplayFormatedText ? (
        <div className="flex items-end gap-3">
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: String(form?.data?.idMissionDataDisplayFormatedText || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      ) : (
        <div className="flex w-full gap-3">
          <h3 className="text-textPrimary mb-4 w-full text-2xl font-semibold">Primary Applicant Information</h3>
        </div>
      )}
      <form className="flex flex-wrap justify-center gap-4">
        <TextField
          isPdf={true}
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], name: e.target.value } }))}
          required
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.name}
          label="Name:*"
          name="name"
          className={`max-w-[400px]!`}
        />
        <TextField
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.email}
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], email: e.target.value } }))}
          label="Email Address:*"
          required
          name="email"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="date"
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.dateOfBirth}
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], dateOfBirth: e.target.value } }))}
          label="Date of Birth:*"
          required
          name="dateOfBirth"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.idType}
          name="idType"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], idType: e.target.value } }))}
          label="Id Type:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.idIssuer}
          name="idIssuer"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], idIssuer: e.target.value } }))}
          label="Id Issuer:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.idExpiryDate}
          name="idExpiryDate"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], idExpiryDate: e.target.value } }))}
          label="Id Expiry Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.issueDate}
          name="issueDate"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], issueDate: e.target.value } }))}
          label="Issue Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          isPdf={true}
          disabled={isDisabledAllFields}
          required
          name="idNumber"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], idNumber: e.target.value } }))}
          value={formInnerData?.[sectionKey]?.idNumber}
          label="Id Number:*"
          className={'max-w-[400px]!'}
        />{' '}
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          className="w-full max-w-[400px]"
          options={{
            types: ['address'],
            fields: ['address_components', 'geometry', 'formatted_address', 'place_id'],
          }}
        >
          <TextField
            type="text"
            isPdf={true}
            required
            disabled={isDisabledAllFields}
            value={formInnerData?.[sectionKey]?.streetAddress}
            name="streetAddress"
            onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], streetAddress: e.target.value } }))}
            label="Street Address:*"
            className={'max-w-[400px]!'}
          />
        </Autocomplete>
        <TextField
          type="text"
          isPdf={true}
          required
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.city}
          name="city"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], city: e.target.value } }))}
          label="City:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          isPdf={true}
          required
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.zipCode}
          name="zipCode"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], zipCode: e.target.value } }))}
          label="Zip Code:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          isPdf={true}
          required
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.state}
          name="state"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], state: e.target.value } }))}
          label="State:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          isPdf={true}
          required
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.country}
          name="country"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], country: e.target.value } }))}
          label="Country:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.companyTitle}
          name="companyTitle"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], companyTitle: e.target.value } }))}
          label="Company Title:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          isPdf={true}
          disabled={isDisabledAllFields}
          value={formInnerData?.[sectionKey]?.phoneNumber}
          name="phoneNumber"
          onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], phoneNumber: e.target.value } }))}
          label="Phone Number:*"
          required
          type="text"
          formatting="3,3,4"
          className={'max-w-[400px]!'}
        />
        <div className="flex w-full border bg-white p-4">
          <RadioInputType
            disabled={isDisabledAllFields}
            className={`w-full`}
            field={{
              label: 'What is the role you are filling for the company as you complete this application? ',
              options: [
                {
                  label:
                    'A primary company operator/controller (C-level executive, owner or other person that holds significant control over company direction and decisions)',
                  value: 'primaryOperatorAndController',
                },
                {
                  label:
                    'The primary contact for the company for this product or service, but not a company operator/controller ',
                  value: 'primaryContact',
                },
                {
                  label: 'Both a company operator and the primary contact',
                  value: 'both',
                },
              ],
              name: 'roleFillingForCompany',
              required: true,
            }}
            form={{ roleFillingForCompany: formInnerData?.[sectionKey]?.roleFillingForCompany }}
            onChange={e => setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], roleFillingForCompany: e.target.value } }))}
          // setForm={setIdMissionVerifiedData}
          />
        </div>
        <div className="flex w-full flex-col">
          <div className="my-4 flex w-full justify-between gap-2">
            {idMissionSection?.signDisplayText && (
              <div className="flex items-end gap-3">
                <div
                  // className="flex flex-1 items-end gap-3"
                  className="w-full"
                  dangerouslySetInnerHTML={{
                    __html: idMissionSection?.signDisplayText,
                  }}
                />
              </div>
            )}
          </div>
          <SignatureBox
            disabled={isDisabledAllFields}
            isPdf={true}
            oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.secureUrl}
            className={'min-w-full'}
            onSave={signatureUploadHandler}
          />
        </div>
      </form>
    </div>
  );
};

export default IdMissionDataPdf;
