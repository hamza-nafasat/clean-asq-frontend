import Button from '@/components/shared/small/Button';
import Checkbox from '@/components/shared/small/Checkbox';
import CustomLoading from '@/components/shared/small/CustomLoading';
import Modal from '@/components/shared/small/Modal';
import TextField from '@/components/shared/small/TextField';
import { getVerificationTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import {
  useCompanyLookupMutation,
  useCompanyVerificationMutation,
  useFormateTextInMarkDownMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useUpdateFormMutation,
} from '@/redux/apis/formApis';
import { addLookupData } from '@/redux/slices/companySlice';
import { updateFormHeaderAndFooter, updateFormState } from '@/redux/slices/formSlice';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { GoCheckCircle } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LocationStatusModal from './LocationStatusModal';

const columns = [
  { name: 'Field', selector: row => row.name, sortable: true, width: '150px' },
  { name: 'Result', grow: 2, wrap: true, selector: row => row.result },
];

function CompanyVerification({ formId, brandingName }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state?.auth);
  const [loading, setLoading] = useState(false);
  const [totalSearchStreatgies, setTotalSearchStreatgies] = useState(0);
  const [successfullyVerifiedStreatgies, setSuccessfullyVerifiedStreatgies] = useState(0);
  const [lookupDataForTable, setLookupDataForTable] = useState([]);
  const [form, setForm] = useState({ name: '', url: '', noWebsite: false });
  const [apisRes, setApisRes] = useState({ companyLookup: {}, companyVerify: {} });
  const [verifyCompany, { isLoading: verifyCompanyLoading }] = useCompanyVerificationMutation();
  const [lookupCompany, { isLoading: lookupCompanyLoading }] = useCompanyLookupMutation();
  const { primaryColor, textColor, backgroundColor, secondaryColor, logo } = useBranding();
  const tableStyles = getVerificationTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const { formData } = useSelector(state => state?.form);
  const { data: formBackendData, isLoading, refetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [saveFormInDraft] = useSaveFormInDraftMutation();
  const [locationStatusModal, setLocationStatusModal] = useState(false);
  const [locationData, setLocationData] = useState({});
  const [isCreator, setIsCreator] = useState(false);
  const [openCompanyVerificationDisplayTextModal, setOpenCompanyVerificationDisplayTextModal] = useState(false);

  useEffect(() => {
    if (user && formBackendData) {
      setIsCreator(user?._id && user?._id === formBackendData?.data?.owner && user?.role !== 'guest');
    }
    // add footer and header text in state
    if (formBackendData?.data?.footerText || formBackendData?.data?.headerText || formBackendData?.data?.name) {
      dispatch(
        updateFormHeaderAndFooter({
          headerText: formBackendData?.data?.headerText || formBackendData?.data?.name || '',
          footerText: formBackendData?.data?.footerText || 'All rights reserved',
        })
      );
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ headerText: '', footerText: 'All rights reserved' }));
    };
  }, [dispatch, formBackendData, user]);

  const handleSubmit = async () => {
    try {
      if (form?.noWebsite) {
        return navigate(`/application-form/${brandingName}/${formId}`);
      } else {
        if (!form?.name || !form?.url) return toast.error('Please fill all fields');
        setLoading(true);
        const companyVerifyPromise = verifyCompany({ name: form?.name, url: form?.url, formId }).unwrap();
        const companyVerifyRes = await companyVerifyPromise;
        if (companyVerifyRes?.success && companyVerifyRes?.data?.verificationStatus !== 'unverified') {
          setApisRes({ companyVerify: companyVerifyRes?.data });
          setApisRes(prev => ({ ...prev, companyVerify: companyVerifyRes?.data }));
          toast.success('Company verified successfully');
          setLoading(false);
          companyLookup();
          return navigate(`/application-form/${brandingName}/${formId}`);
        } else {
          toast.error('Company verification failed, please try again');
        }
      }
    } catch (error) {
      console.log('Error verifying company:', error);
      toast.error(error?.data?.message || 'Failed to verify company');
    } finally {
      setLoading(false);
    }
  };

  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        const formDataInRedux = { ...formData, [name]: data };
        // console.log('save in progress', formDataInRedux);
        const res = await saveFormInDraft({ formId: formId, formData: formDataInRedux }).unwrap();
        if (res.success) {
          console.log('form saved in draft successfully');
        }
      } catch (error) {
        console.log('error while saving form in draft', error);
        toast.error(error?.data?.message || 'Error while saving form in draft');
      }
    },
    [formData, formId, saveFormInDraft]
  );

  const companyLookup = async () => {
    if (!form?.name || !form?.url) return toast.error('Please fill all fields');
    try {
      const lookupCompanyPromise = lookupCompany({ name: form?.name, url: form?.url, formId }).unwrap();
      const lookupCompanyRes = await lookupCompanyPromise;
      if (lookupCompanyRes?.success) {
        setApisRes(prev => ({ ...prev, companyLookup: lookupCompanyRes?.data }));
        const lookupDataObj = lookupCompanyRes?.data?.lookupData;
        const totalStrEntries = Object.entries(lookupDataObj);
        const totalStr = totalStrEntries.filter(([key]) => key.includes('source'));
        const verifiedStr = totalStrEntries.filter(([key]) => !key.includes('source'));

        setTotalSearchStreatgies(totalStr?.length);
        setSuccessfullyVerifiedStreatgies(verifiedStr?.length);
        let totalLookupData = totalStr?.map(([key, value]) => {
          let nameObj = verifiedStr?.find(([k]) => key?.includes(k));
          if (value == 'Not found') return {};
          return {
            source: String(value).split(',')[0],
            name: nameObj?.[0],
            result: nameObj?.[1],
          };
        });
        totalLookupData = totalLookupData.filter(item => item.name !== undefined);
        setLookupDataForTable(totalLookupData);
        dispatch(addLookupData(totalLookupData));
        dispatch(updateFormState({ data: totalLookupData, name: 'company_lookup_data' }));
        await saveInProgress({ data: totalLookupData, name: 'company_lookup_data' });
        toast.success('Company lookup successfully completed');
      }
    } catch (error) {
      console.log('Error lookup company:', error);
      toast.error(error?.data?.message || 'Failed to lookup company');
    }
  };

  useEffect(() => {
    if (formBackendData?.data) {
      const form = formBackendData?.data;
      setLocationStatusModal(form?.locationStatus);
      setLocationData({
        logo: form?.branding?.selectedLogo || logo,
        title: form?.locationTitle,
        subtitle: form?.locationSubtitle,
        message: form?.formatedLocationMessage,
      });
    }
  }, [formBackendData, logo]);

  return isLoading ? (
    <CustomLoading />
  ) : (
    <>
      {openCompanyVerificationDisplayTextModal && formBackendData?.data && (
        <Modal onClose={() => setOpenCompanyVerificationDisplayTextModal(false)}>
          <CompanyVerificationDisplayText
            formRefetch={refetch}
            setOpenCompanyVerificationDisplayTextModal={setOpenCompanyVerificationDisplayTextModal}
            form={formBackendData?.data}
          />
        </Modal>
      )}
      <div className="flex flex-col space-y-8">
        {locationStatusModal && (
          <LocationStatusModal
            locationStatusModal={locationStatusModal}
            setLocationStatusModal={setLocationStatusModal}
            locationData={locationData}
            formId={formId}
            navigate={navigate}
            brandingName={formBackendData?.branding?.name}
          />
        )}
        <div className="border-frameColor w-full rounded-md border p-4">
          <div className="flex items-center justify-center gap-3">
            {formBackendData?.data?.companyVerificationDisplayFormatedText && (
              <div className="mb-4 flex w-full items-center justify-between">
                <div
                  dangerouslySetInnerHTML={{
                    __html: String(formBackendData?.data?.companyVerificationDisplayFormatedText).replace(
                      /<a(\s+.*?)?>/g,
                      match => {
                        if (match.includes('target=')) return match; // avoid duplicates
                        return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                      }
                    ),
                  }}
                />
              </div>
            )}
            {isCreator && (
              <div className="flex w-full justify-end">
                <Button
                  className="h-fit"
                  label={'Customize Display Text'}
                  onClick={() => setOpenCompanyVerificationDisplayTextModal(true)}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-4">
            <TextField
              label={'Legal company name *'}
              className="w-full rounded px-2 text-sm"
              value={form.name}
              onChange={
                verifyCompanyLoading || lookupCompanyLoading
                  ? () => { }
                  : e => setForm({ ...form, name: e.target.value })
              }
            />
            <TextField
              label={'Website URL *'}
              className="w-full rounded px-2 text-sm"
              value={form.url}
              onChange={
                verifyCompanyLoading || lookupCompanyLoading ? () => { } : e => setForm({ ...form, url: e.target.value })
              }
            />
            <Checkbox
              id={'noWebsite'}
              label={'This company has no website'}
              name={'noWebsite'}
              checked={form.noWebsite}
              onChange={e => setForm({ ...form, noWebsite: e.target.checked })}
            />
            {apisRes?.companyVerify?.confidenceScore && apisRes?.companyVerify?.verificationStatus && (
              <div className="flex w-44 items-center gap-2 rounded-2xl border p-2 py-1">
                <div>
                  <GoCheckCircle className="font-medium text-blue-400" />
                </div>
                <div className="text-textPrimary text-xs">
                  {apisRes?.companyVerify?.originalCompanyName || form?.name}{' '}
                  {apisRes?.companyVerify?.verificationStatus} ({apisRes?.companyVerify?.confidenceScore}%)
                </div>
              </div>
            )}

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                label="Continue"
                onClick={handleSubmit}
                disabled={loading}
                className={` ${loading && 'pointer-events-auto cursor-not-allowed opacity-20'}`}
              />
            </div>
          </div>
        </div>
        {(verifyCompanyLoading || lookupCompanyLoading) && <CustomLoading />}
        {lookupDataForTable?.length && !(verifyCompanyLoading || lookupCompanyLoading) ? (
          <div className="border-frameColor w-full space-y-4 rounded-md border p-4">
            <div className="flex items-center gap-3">
              <div>
                <GoCheckCircle className="font-medium text-blue-400" />
              </div>
              <div className="text-textPrimary text-xl font-medium">Company Information Collected</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-textPrimary text-sm">
                Collection rate: {apisRes?.companyLookup?.collectionRate}% ({successfullyVerifiedStreatgies}/
                {totalSearchStreatgies} successful)
              </div>
              <div className="border-frameColor rounded-2xl border p-1 text-xs font-medium">
                {totalSearchStreatgies} strategies
              </div>
            </div>
            <div className="p-4">
              <DataTable
                title="Company Verification"
                columns={columns}
                data={lookupDataForTable}
                customStyles={tableStyles}
              />
            </div>
          </div>
        ) : null}

        {isCreator && (
          <Button
            onClick={() => {
              return navigate(`/application-form/${brandingName}/${formId}`);
            }}
            label={'Skip'}
          />
        )}
      </div>
    </>
  );
}

export default CompanyVerification;

const CompanyVerificationDisplayText = ({ form, formRefetch, setOpenCompanyVerificationDisplayTextModal }) => {
  const [updateForm, { isLoading: isUpdatingSection }] = useUpdateFormMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [displayData, setDisplayData] = useState({
    companyVerificationDisplayText: form?.companyVerificationDisplayText || '',
    companyVerificationDisplayFormatingInstructions: form?.companyVerificationDisplayFormatingInstructions || '',
    companyVerificationDisplayFormatedText: form?.companyVerificationDisplayFormatedText || '',
  });

  const handleUpdateSectionForSignature = async () => {
    try {
      const res = await updateForm({
        _id: form?._id,
        data: {
          companyVerificationDisplayText: displayData.companyVerificationDisplayText,
          companyVerificationDisplayFormatingInstructions: displayData.companyVerificationDisplayFormatingInstructions,
          companyVerificationDisplayFormatedText: displayData.companyVerificationDisplayFormatedText,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        setOpenCompanyVerificationDisplayTextModal(false);
      }
    } catch (error) {
      console.log('Error while updating signature', error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!displayData?.companyVerificationDisplayText || !displayData?.companyVerificationDisplayFormatingInstructions) {
      toast.error('Please enter formatting instruction and text to format');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: displayData.companyVerificationDisplayText,
        instructions: displayData?.companyVerificationDisplayFormatingInstructions,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setDisplayData(prev => ({ ...prev, companyVerificationDisplayFormatedText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
    }
  }, [
    displayData.companyVerificationDisplayText,
    displayData?.companyVerificationDisplayFormatingInstructions,
    formateTextInMarkDown,
  ]);

  return (
    <div className="flex flex-col gap-2 border-2 p-2 pb-4">
      {/* display text  */}
      <div className="flex w-full flex-col gap-2 pb-4">
        <TextField
          type="textarea"
          label="Display Text"
          value={displayData?.companyVerificationDisplayText}
          name="displayText"
          onChange={e => setDisplayData(prev => ({ ...prev, companyVerificationDisplayText: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={displayData?.companyVerificationDisplayFormatingInstructions}
          onChange={e =>
            setDisplayData(prev => ({ ...prev, companyVerificationDisplayFormatingInstructions: e.target.value }))
          }
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={'Format Text'} />
        </div>
        {displayData?.companyVerificationDisplayFormatedText && (
          <div
            className="h-full p-4"
            dangerouslySetInnerHTML={{
              __html: String(displayData?.companyVerificationDisplayFormatedText || '').replace(
                /<a(\s+.*?)?>/g,
                match => {
                  if (match.includes('target=')) return match; // avoid duplicates
                  return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                }
              ),
            }}
          />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          onClick={() => setOpenCompanyVerificationDisplayTextModal(false)}
          disabled={isUpdatingSection}
          className=" "
          variant="secondary"
          label={'Cancel'}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} className="" label={'Save'} />
      </div>
    </div>
  );
};
