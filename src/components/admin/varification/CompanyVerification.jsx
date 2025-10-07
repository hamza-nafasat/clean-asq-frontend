import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import Modal from '@/components/shared/small/Modal';
import TextField from '@/components/shared/small/TextField';
import { getVerificationTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import {
  useCompanyLookupMutation,
  useCompanyVerificationMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
} from '@/redux/apis/formApis';
import { addLookupData } from '@/redux/slices/companySlice';
import { updateFormState } from '@/redux/slices/formSlice';
import { useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { GoCheckCircle } from 'react-icons/go';
import { IoShieldOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import LocationStatusModal from './LocationStatusModal';

const columns = [
  { name: 'Field', selector: row => row.name, sortable: true, width: '150px' },
  { name: 'Result', grow: 2, wrap: true, selector: row => row.result },
];

function CompanyVerification({ formId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state?.auth);
  const [loading, setLoading] = useState(false);
  const [totalSearchStreatgies, setTotalSearchStreatgies] = useState(0);
  const [successfullyVerifiedStreatgies, setSuccessfullyVerifiedStreatgies] = useState(0);
  const [lookupDataForTable, setLookupDataForTable] = useState([]);
  const [form, setForm] = useState({ name: '', url: '' });
  const [apisRes, setApisRes] = useState({ companyLookup: {}, companyVerify: {} });
  const [verifyCompany, { isLoading: verifyCompanyLoading }] = useCompanyVerificationMutation();
  const [lookupCompany, { isLoading: lookupCompanyLoading }] = useCompanyLookupMutation();
  const { primaryColor, textColor, backgroundColor, secondaryColor, logo } = useBranding();
  const tableStyles = getVerificationTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const { formData } = useSelector(state => state?.form);
  const { data: formBackendData, isLoading } = useGetSingleFormQueryQuery({ _id: formId });
  const [saveFormInDraft] = useSaveFormInDraftMutation();
  const [locationStatusModal, setLocationStatusModal] = useState(false);
  const [locationData, setLocationData] = useState({});
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (user && formBackendData) {
      setIsCreator(user?._id && user?._id === formBackendData?.data?.owner && user?.role !== 'guest');
    }
  }, [formBackendData, user]);

  const handleSubmit = async () => {
    if (!form?.name || !form?.url) return toast.error('Please fill all fields');
    try {
      setLoading(true);
      const companyVerifyPromise = verifyCompany({ name: form?.name, url: form?.url, formId }).unwrap();
      const companyVerifyRes = await companyVerifyPromise;
      if (companyVerifyRes?.success && companyVerifyRes?.data?.verificationStatus !== 'unverified') {
        setApisRes({ companyVerify: companyVerifyRes?.data });
        setApisRes(prev => ({ ...prev, companyVerify: companyVerifyRes?.data }));
        toast.success('Company verified successfully');
        setLoading(false);
        companyLookup();
        navigate(`/application-form/${formId}`);
      } else {
        toast.error('Company verification failed, please try again');
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
        toast.success('Company Lookup successfully');
      }
    } catch (error) {
      console.log('Error lookup company:', error);
      toast.error(error?.data?.message || 'Failed to lookup company');
    }
  };

  // const handleNext = () => {
  //   // console.log(lookupDataForTable);
  //   dispatch(addLookupData(lookupDataForTable));
  //   dispatch(updateFormState({ data: lookupDataForTable, name: 'company_lookup_data' }));
  //   navigate(`/singleform/stepper/${formId}`);
  // };

  useEffect(() => {
    if (formBackendData?.data) {
      setLocationStatusModal(formBackendData?.data?.locationStatus);
      setLocationData({
        logo: formBackendData?.data?.branding?.selectedLogo || logo,
        title: formBackendData?.data?.locationTitle,
        subtitle: formBackendData?.data?.locationSubtitle,
        message: formBackendData?.data?.formatedLocationMessage,
      });
    }
  }, [formBackendData, logo]);

  return isLoading ? (
    <CustomLoading />
  ) : (
    <div className="flex flex-col space-y-8">
      {locationStatusModal && (
        <LocationStatusModal
          locationStatusModal={locationStatusModal}
          setLocationStatusModal={setLocationStatusModal}
          locationData={locationData}
          formId={formId}
          navigate={navigate}
        />
      )}
      <div className="border-frameColor bg-backgroundColor w-full rounded-md border p-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div>
              <IoShieldOutline className="font-medium text-blue-400" />
            </div>
            <div className="text-textPrimary text-xl font-medium">Company Verification</div>
          </div>
          <div className="text-textPrimary text-xs">Verify that a company name and website URL belong together</div>
        </div>
        <div className="flex flex-col space-y-4">
          <TextField
            label={'Legal company name *'}
            className="w-full rounded px-2 text-sm"
            value={form.name}
            onChange={
              verifyCompanyLoading || lookupCompanyLoading ? () => {} : e => setForm({ ...form, name: e.target.value })
            }
          />
          <TextField
            label={'Website URL *'}
            className="w-full rounded px-2 text-sm"
            value={form.url}
            onChange={
              verifyCompanyLoading || lookupCompanyLoading ? () => {} : e => setForm({ ...form, url: e.target.value })
            }
          />
          {apisRes?.companyVerify?.confidenceScore && apisRes?.companyVerify?.verificationStatus && (
            <div className="flex w-44 items-center gap-2 rounded-2xl border p-2 py-1">
              <div>
                <GoCheckCircle className="font-medium text-blue-400" />
              </div>
              <div className="text-textPrimary text-xs">
                {apisRes?.companyVerify?.originalCompanyName || form?.name} {apisRes?.companyVerify?.verificationStatus}{' '}
                ({apisRes?.companyVerify?.confidenceScore}%)
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center space-x-2 px-2">
            <input type="checkbox" />
            <label className="text-textPrimary text-sm font-medium">This company has no website</label>
          </div>
          <div className="flex items-center justify-end">
            <Button
              label="Verify Company"
              onClick={handleSubmit}
              disabled={loading}
              className={` ${loading && 'pointer-events-auto cursor-not-allowed opacity-20'}`}
            />
          </div>
        </div>
      </div>
      {(verifyCompanyLoading || lookupCompanyLoading) && <CustomLoading />}
      {lookupDataForTable?.length && !(verifyCompanyLoading || lookupCompanyLoading) ? (
        <div className="border-frameColor bg-backgroundColor w-full space-y-4 rounded-md border p-4">
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
            navigate(`/application-form/${formId}`);
          }}
          label={'Skip'}
        />
      )}
    </div>
  );
}

export default CompanyVerification;
