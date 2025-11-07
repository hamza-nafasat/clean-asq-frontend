import SignatureBox from '@/components/shared/SignatureBox';
import { RadioInputType } from '@/components/shared/small/DynamicField';
import TextField from '@/components/shared/small/TextField';
import { Button } from '@/components/ui/button';
import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { Autocomplete } from '@react-google-maps/api';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const IdMissionDataPdf = () => {
  const [autocomplete, setAutocomplete] = useState('');
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState({
    name: '',
    idNumber: '',
    streetAddress: '',
    phoneNumber: '',
    companyTitle: '',
    issueDate: '',
    idIssuer: '',
    idType: '',
    idExpiryDate: '',
    city: '',
    state: '',
    dateOfBirth: '',
    zipCode: '',
    country: '',
    roleFillingForCompany: '',
    address2: 'None',
    signature: { secureUrl: '', publicId: '', resourceType: '' },
  });

  const params = useParams();

  const formId = params.formId;

  const { user } = useSelector(state => state.auth);
  const { data: form, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId });
  const idMissionSection = form?.data?.sections?.find(sec => sec?.title?.toLowerCase() == 'id_verification_blk');

  const onLoad = useCallback(autoC => {
    autoC.setFields(['address_components', 'formatted_address', 'geometry', 'place_id']);
    setAutocomplete(autoC);
  }, []);

  const onPlaceChanged = () => {
    const place = autocomplete.getPlace();
    // console.log('place', place);
    fillBasicComponents(place.address_components || []);
    if (!place.address_components.some(c => c.types.includes('postal_code'))) {
      const { lat, lng } = place.geometry.location;
      reverseGeocode(lat(), lng());
    }
  };

  const handleSignature = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error('Please add signature');
      if (idMissionVerifiedData?.signature?.publicId || idMissionVerifiedData?.signature?.secureUrl) {
        await deleteImageFromCloudinary(
          idMissionVerifiedData?.signature?.publicId,
          idMissionVerifiedData?.signature?.resourceType
        );
      }
      const { secureUrl, publicId, resourceType } = await uploadImageOnCloudinary(file);
      if (!secureUrl || !publicId) return toast.error('Something went wrong while uploading image');
      setIdMissionVerifiedData(prev => ({ ...prev, signature: { secureUrl, publicId, resourceType } }));
      toast.success('Signature uploaded successfully');
    } catch (error) {
      console.log('error while uploading image', error);
      toast.error('Something went wrong while uploading image');
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  const isCreator = user?._id && user?._id == form?.data?.owner && user?.role !== 'guest';
  return (
    <div className="flex w-full flex-col p-2">
      <h3 className="text-textPrimary text-center text-2xl font-semibold">Id Mission Data</h3>
      <form className="flex flex-wrap gap-4">
        <TextField
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, name: e.target.value })}
          required
          value={idMissionVerifiedData?.name}
          label="Name:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          value={user?.email}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, email: e.target.value })}
          label="Email Address:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          type="date"
          value={idMissionVerifiedData?.dateOfBirth}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, dateOfBirth: e.target.value })}
          label="Date of Birth:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          value={idMissionVerifiedData?.idType}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idType: e.target.value })}
          label="Id Type:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          value={idMissionVerifiedData?.idIssuer}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idIssuer: e.target.value })}
          label="Id Issuer:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          value={idMissionVerifiedData?.idExpiryDate}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idExpiryDate: e.target.value })}
          label="Id Expiry Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          value={idMissionVerifiedData?.issueDate}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, issueDate: e.target.value })}
          label="Issue Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          required
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idNumber: e.target.value })}
          value={idMissionVerifiedData?.idNumber}
          label="Id Number:*"
          className={'max-w-[400px]!'}
        />{' '}
        <Autocomplete
          onLoad={onLoad}
          className="w-full max-w-[400px]"
          onPlaceChanged={onPlaceChanged}
          options={{ fields: ['address_components', 'formatted_address', 'geometry', 'place_id'] }}
        >
          <TextField
            type="text"
            required
            value={idMissionVerifiedData?.streetAddress}
            onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, streetAddress: e.target.value })}
            label="Street Address:*"
            className={'max-w-[400px]!'}
          />
        </Autocomplete>
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.city}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, city: e.target.value })}
          label="City:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.zipCode}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, zipCode: e.target.value })}
          label="Zip Code:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.state}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, state: e.target.value })}
          label="State:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.country}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, country: e.target.value })}
          label="Country:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          value={idMissionVerifiedData?.companyTitle}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, companyTitle: e.target.value })}
          label="Company Title:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          value={idMissionVerifiedData?.phoneNumber}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, phoneNumber: e.target.value })}
          label="Phone Number:*"
          required
          type="tel"
          className={'max-w-[400px]!'}
        />
        <div className="flex w-full border bg-white p-4">
          <RadioInputType
            className={'w-full'}
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
                    'The primary contact for the company for this product and service, but not a company operator/controller ',
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
            form={{ roleFillingForCompany: idMissionVerifiedData?.roleFillingForCompany }}
            onChange={e =>
              setIdMissionVerifiedData({ ...idMissionVerifiedData, roleFillingForCompany: e.target?.value })
            }
            setForm={setIdMissionVerifiedData}
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
            <div className="flex items-center justify-end gap-2">
              {isCreator && (
                <div className="flex items-center gap-2">
                  <Button label="Enable Help" onClick={() => setShowSignatureHelpModal(true)} />
                  <Button label="Customize Signature" onClick={() => setShowSignatureModal(true)} />
                </div>
              )}
              {idMissionSection?.signAiResponse && <Button label="Help" onClick={() => setOpenAiHelpSignModal(true)} />}
            </div>
          </div>
          <SignatureBox
            oldSignatureUrl={idMissionVerifiedData?.signature?.secureUrl}
            className={'min-w-full'}
            onSave={handleSignature}
          />
        </div>
      </form>
      {/* <div className="flex w-full items-center justify-end gap-2 p-2">
                {isCreator && (
                  <Button
                    onClick={() => {
                      navigate(`/singleform/stepper/${formId}`);
                    }}
                    className="mt-4"
                    variant="secondary"
                    label={'Skip for now'}
                  />
                )}
                <Button
                  disabled={!isAllRequiredFieldsFilled || submiting}
                  label={!isAllRequiredFieldsFilled ? 'Some fields are missing' : 'Continue to next'}
                  onClick={submitIdMissionData}
                  className="mt-4"
                />
              </div> */}
    </div>
  );
};

export default IdMissionDataPdf;
