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
  const { isDisabledAllFields } = useSelector(state => state.form);

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
        createdAt: formDataOfIdMission?.createdAt || new Date().toISOString(),
        updatedAt: formDataOfIdMission?.updatedAt || new Date().toISOString(),
      });
    }
  }, [formData?.idMission, idMissionSection]);

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
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, name: e.target.value })}
          required
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.name}
          label="Name:*"
          name="name"
          className={`max-w-[400px]!`}
        />
        <TextField
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.email}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, email: e.target.value })}
          label="Email Address:*"
          required
          name="email"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="date"
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.dateOfBirth}
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, dateOfBirth: e.target.value })}
          label="Date of Birth:*"
          required
          name="dateOfBirth"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.idType}
          name="idType"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idType: e.target.value })}
          label="Id Type:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.idIssuer}
          name="idIssuer"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idIssuer: e.target.value })}
          label="Id Issuer:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.idExpiryDate}
          name="idExpiryDate"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idExpiryDate: e.target.value })}
          label="Id Expiry Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          type="text"
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.issueDate}
          name="issueDate"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, issueDate: e.target.value })}
          label="Issue Date:*"
          required
          className={'max-w-[400px]!'}
        />{' '}
        <TextField
          disabled={isDisabledAllFields}
          required
          name="idNumber"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idNumber: e.target.value })}
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
            disabled={isDisabledAllFields}
            value={idMissionVerifiedData?.streetAddress}
            name="streetAddress"
            onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, streetAddress: e.target.value })}
            label="Street Address:*"
            className={'max-w-[400px]!'}
          />
        </Autocomplete>
        <TextField
          type="text"
          required
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.city}
          name="city"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, city: e.target.value })}
          label="City:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.zipCode}
          name="zipCode"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, zipCode: e.target.value })}
          label="Zip Code:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.state}
          name="state"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, state: e.target.value })}
          label="State:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          type="text"
          required
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.country}
          name="country"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, country: e.target.value })}
          label="Country:*"
          className={'max-w-[400px]!'}
        />
        <TextField
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.companyTitle}
          name="companyTitle"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, companyTitle: e.target.value })}
          label="Company Title:*"
          required
          className={'max-w-[400px]!'}
        />
        <TextField
          disabled={isDisabledAllFields}
          value={idMissionVerifiedData?.phoneNumber}
          name="phoneNumber"
          onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, phoneNumber: e.target.value })}
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
            form={{ roleFillingForCompany: idMissionVerifiedData?.roleFillingForCompany }}
            onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, roleFillingForCompany: e.target.value })}
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
            disabled={isDisabledAllFields}
            isPdf={true}
            oldSignatureUrl={idMissionVerifiedData?.signature?.secureUrl}
            className={'min-w-full'}
            onSave={() => { }}
          />
        </div>
      </form>
    </div>
  );
};

export default IdMissionDataPdf;
