import { useRef } from "react";
import { useSelector } from "react-redux";
import { Autocomplete } from "@react-google-maps/api";

import { useGetSingleFormQueryQuery } from "@/redux/apis/form.apis";
import SignatureBox from "@/components/global/SignatureBox";
import SimpleRadioInputType from "@/components/global/SimpleRadioInputType";
import TextField from "@/components/shared/TextField";
import { FIELD_FORMATS, FIELD_TYPES, ID_MISSION_ROLES, SECTION_TITLES, SIGNATURE_KEY } from "@/constants";
import { setSectionFieldValue } from "@/utils/fieldFormatting";
import { hasPostalCode, parseAddressComponents, parseAddressResults } from "@/utils/googleAddress";
import HtmlContent from "@/components/shared/HtmlContent";
import { uploadSectionSignature } from "@/utils/sectionSignature";

const GEOCODER_OK = "OK";

const FIELDS_BEFORE_ADDRESS = [
  { name: "name", label: "Name:*" },
  { name: "email", label: "Email Address:*" },
  { name: "dateOfBirth", label: "Date of Birth:*", type: FIELD_TYPES.DATE },
  { name: "idType", label: "Id Type:*", type: FIELD_TYPES.TEXT },
  { name: "idIssuer", label: "Id Issuer:*", type: FIELD_TYPES.TEXT },
  { name: "idExpiryDate", label: "Id Expiry Date:*", type: FIELD_TYPES.TEXT },
  { name: "issueDate", label: "Issue Date:*", type: FIELD_TYPES.TEXT },
  { name: "idNumber", label: "Id Number:*" },
];

const ADDRESS_FIELD = { name: "streetAddress", label: "Street Address:*", type: FIELD_TYPES.TEXT };

const FIELDS_AFTER_ADDRESS = [
  { name: "city", label: "City:*", type: FIELD_TYPES.TEXT },
  { name: "zipCode", label: "Zip Code:*", type: FIELD_TYPES.TEXT },
  { name: "state", label: "State:*", type: FIELD_TYPES.TEXT },
  { name: "country", label: "Country:*", type: FIELD_TYPES.TEXT },
  { name: "companyTitle", label: "Company Title:*" },
  { name: "phoneNumber", label: "Phone Number:*", type: FIELD_TYPES.TEXT, formatting: FIELD_FORMATS.PHONE },
];

const ADDRESS_AUTOCOMPLETE_OPTIONS = {
  types: ["address"],
  fields: ["address_components", "geometry", "formatted_address", "place_id"],
};

const ROLE_FIELD = {
  label: "What is the role you are filling for the company as you complete this application? ",
  options: [
    {
      label:
        "A primary company operator/controller (C-level executive, owner or other person that holds significant control over company direction and decisions)",
      value: ID_MISSION_ROLES.PRIMARY_OPERATOR_AND_CONTROLLER,
    },
    {
      label: "The primary contact for the company for this product or service, but not a company operator/controller ",
      value: ID_MISSION_ROLES.PRIMARY_CONTACT,
    },
    { label: "Both a company operator and the primary contact", value: ID_MISSION_ROLES.BOTH },
  ],
  name: "roleFillingForCompany",
  required: true,
};

const IdMissionDataPdf = ({ formId, sectionKey, formInnerData, setFormInnerData }) => {
  const { data: form } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const autocompleteRef = useRef(null);
  const idMissionSection = form?.data?.sections?.find(
    (sec) => sec?.title?.toLowerCase() == SECTION_TITLES.ID_VERIFICATION,
  );
  const sectionData = formInnerData?.[sectionKey];

  const setSectionValue = (key, value) => setSectionFieldValue(setFormInnerData, sectionKey, key, key, value);

  const mergeParsedAddress = (parsed) =>
    setFormInnerData((prev) => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], ...parsed } }));

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== GEOCODER_OK || !results?.length) return;
      const parsed = parseAddressResults(results);
      setFormInnerData((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev?.[sectionKey],
          streetAddress: parsed.streetAddress,
          city: parsed.city,
          state: parsed.state,
          country: parsed.country,
          zipCode: parsed.zipCode,
          lat: parsed.lat ?? prev?.[sectionKey]?.lat,
          lng: parsed.lng ?? prev?.[sectionKey]?.lng,
        },
      }));
    });
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;

    // geocode by place id when the place has no address parts
    if (!place.address_components?.length && place.place_id) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: place.place_id }, (results, status) => {
        if (status === GEOCODER_OK && results?.length) mergeParsedAddress(parseAddressResults(results));
        else mergeParsedAddress(parseAddressComponents(place.address_components || [], place.geometry));
      });
      return;
    }

    mergeParsedAddress(parseAddressComponents(place.address_components || [], place.geometry));
    if (!hasPostalCode(place) && place.geometry?.location) {
      reverseGeocode(place.geometry.location.lat(), place.geometry.location.lng());
    }
  };

  const renderTextField = ({ name, label, type, formatting }) => (
    <TextField
      key={name}
      type={type}
      isPdf={true}
      required
      disabled={isDisabledAllFields}
      value={sectionData?.[name]?.value || ""}
      name={name}
      label={label}
      formatting={formatting}
      onChange={(e) => setSectionValue(name, e.target.value)}
      className="max-w-100!"
    />
  );

  return (
    <div className="flex w-full flex-col p-2">
      {form?.data?.idMissionDataDisplayFormatedText ? (
        <div className="flex items-end gap-3">
          <HtmlContent className="w-full" html={form?.data?.idMissionDataDisplayFormatedText} />
        </div>
      ) : (
        <div className="flex w-full gap-3">
          <h3 className="text-textPrimary mb-4 w-full text-2xl font-semibold">Primary Applicant Information</h3>
        </div>
      )}
      <form className="flex flex-wrap justify-center gap-4">
        {FIELDS_BEFORE_ADDRESS.map(renderTextField)}
        <Autocomplete
          onLoad={(instance) => {
            autocompleteRef.current = instance;
          }}
          onPlaceChanged={handlePlaceChanged}
          className="w-full max-w-100"
          options={ADDRESS_AUTOCOMPLETE_OPTIONS}
        >
          {renderTextField(ADDRESS_FIELD)}
        </Autocomplete>
        {FIELDS_AFTER_ADDRESS.map(renderTextField)}
        <div className="flex w-full border bg-white p-4">
          <SimpleRadioInputType
            disabled={isDisabledAllFields}
            className="w-full"
            field={ROLE_FIELD}
            form={{ roleFillingForCompany: sectionData?.roleFillingForCompany?.value || "" }}
            onChange={(e) => setSectionValue(ROLE_FIELD.name, e.target.value)}
          />
        </div>
        <div className="flex w-full flex-col">
          <div className="my-4 flex w-full justify-between gap-2">
            {idMissionSection?.signDisplayText && (
              <div className="flex items-end gap-3">
                <HtmlContent className="w-full" html={idMissionSection?.signDisplayText} linkMode="none" />
              </div>
            )}
          </div>
          <SignatureBox
            disabled={isDisabledAllFields}
            isPdf={true}
            oldSignatureUrl={sectionData?.[SIGNATURE_KEY]?.value?.secureUrl}
            className="min-w-full"
            onSave={(file, setIsSaving) =>
              uploadSectionSignature({ file, setIsSaving, sectionKey, formInnerData, setFormInnerData })
            }
          />
        </div>
      </form>
    </div>
  );
};

export default IdMissionDataPdf;
