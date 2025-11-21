import SignatureBox from '@/components/shared/SignatureBox';
import { RadioInputType } from '@/components/shared/small/DynamicField';
import TextField from '@/components/shared/small/TextField';
import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { Autocomplete } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
const IdMissionDataPdf = ({ formId }) => {
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

  const { formData } = useSelector(state => state.form);
  const { data: form } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const idMissionSection = form?.data?.sections?.find(sec => sec?.title?.toLowerCase() == 'id_verification_blk');

  useEffect(() => {
    if (formData?.idMission) {
      const formDataOfIdMission = formData?.idMission;
      setIdMissionVerifiedData({
        name: formDataOfIdMission?.name || '',
        email: formDataOfIdMission?.email || '',
        idNumber: formDataOfIdMission?.idNumber || '',
        idIssuer: formDataOfIdMission?.idIssuer || '',
        idType: formDataOfIdMission?.idType || '',
        idExpiryDate: formDataOfIdMission?.idExpiryDate || '',
        streetAddress: formDataOfIdMission?.streetAddress || '',
        phoneNumber: formDataOfIdMission?.phoneNumber || '',
        zipCode: formDataOfIdMission?.zipCode || '',
        dateOfBirth: formDataOfIdMission?.dateOfBirth || '',
        country: formDataOfIdMission?.country || '',
        issueDate: formDataOfIdMission?.issueDate || '',
        companyTitle: formDataOfIdMission?.companyTitle || '',
        state: formDataOfIdMission?.state || '',
        city: formDataOfIdMission?.city || '',
        address2: formDataOfIdMission?.address2 || 'None',
        signature: formDataOfIdMission?.signature || '',
        roleFillingForCompany: formDataOfIdMission?.roleFillingForCompany || '',
      });
    }
  }, [formData?.idMission, idMissionSection]);

  return (
    <div className="flex w-full flex-col p-2">
      <h3 className="text-textPrimary mb-3 text-2xl font-semibold">ID Mission Data</h3>
      <form className="flex flex-wrap justify-center gap-4">
        <TextField
          onChange={() => {}}
          required
          value={idMissionVerifiedData?.name}
          label="Name:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          value={idMissionVerifiedData?.email}
          onChange={() => {}}
          label="Email Address:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          type="date"
          value={idMissionVerifiedData?.dateOfBirth}
          onChange={() => {}}
          label="Date of Birth:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          value={idMissionVerifiedData?.idType}
          onChange={() => {}}
          label="Id Type:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          value={idMissionVerifiedData?.idIssuer}
          onChange={() => {}}
          label="Id Issuer:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          value={idMissionVerifiedData?.idExpiryDate}
          onChange={() => {}}
          label="Id Expiry Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          value={idMissionVerifiedData?.issueDate}
          onChange={() => {}}
          label="Issue Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          required
          onChange={() => {}}
          value={idMissionVerifiedData?.idNumber}
          label="Id Number:*"
          className={'max-w-[400px]!'}
        />{' '}
        <Autocomplete
          className="w-full max-w-[400px]"
          options={{ fields: ['address_components', 'formatted_address', 'geometry', 'place_id'] }}
        >
          <TextField
            type="text"
            required
            value={idMissionVerifiedData?.streetAddress}
            onChange={() => {}}
            label="Street Address:*"
            className={'max-w-[400px]!'}
          />
        </Autocomplete>
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.city}
          onChange={() => {}}
          label="City:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.zipCode}
          onChange={() => {}}
          label="Zip Code:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.state}
          onChange={() => {}}
          label="State:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          value={idMissionVerifiedData?.country}
          onChange={() => {}}
          label="Country:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          value={idMissionVerifiedData?.companyTitle}
          onChange={() => {}}
          label="Company Title:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          value={idMissionVerifiedData?.phoneNumber}
          onChange={() => {}}
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
            form={{ roleFillingForCompany: idMissionVerifiedData?.roleFillingForCompany }}
            onChange={() => {}}
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
          </div>
          <SignatureBox
            isPdf={true}
            oldSignatureUrl={idMissionVerifiedData?.signature?.secureUrl}
            className={'min-w-full'}
            onSave={() => {}}
          />
        </div>
      </form>
    </div>
  );
};

export default IdMissionDataPdf;
