import BankInfo from '@/components/applicationVerification/BankInfo';
import CompanyInformation from '@/components/applicationVerification/CompanyInformation';
import CompanyOwners from '@/components/applicationVerification/CompanyOwners';
import CustomSection from '@/components/applicationVerification/CustomSection';
import Documents from '@/components/applicationVerification/Documents';
import ProcessingInfo from '@/components/applicationVerification/ProcessingInfo';
import CustomLoading from '@/components/shared/small/CustomLoading';
import {
  useGetSavedFormMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useSubmitFormMutation,
} from '@/redux/apis/formApis';
import { addSavedFormData, updateFormState } from '@/redux/slices/formSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Stepper from '../../../../components/Stepper/Stepper';
import { setIdMissionData } from '@/redux/slices/authSlice';
import AggrementBlock from '@/components/applicationVerification/AggrementBlock';
import useApplyBranding from '@/hooks/useApplyBranding';

export default function ApplicationForm() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const dispatch = useDispatch();
  const { formData, fileData } = useSelector(state => state?.form);

  const [currentStep, setCurrentStep] = useState(0);
  const [sectionNames, setSectionNames] = useState([]);
  const [stepsComps, setStepsComps] = useState([]);
  const [isSavedApiRun, setIsSavedApiRun] = useState(false);

  const { data: form, isLoading: formLoading, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [formSubmit] = useSubmitFormMutation();
  const [getSavedFormData] = useGetSavedFormMutation();
  const [saveFormInDraft] = useSaveFormInDraftMutation();
  const { isApplied } = useApplyBranding({ formId });

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);
  const handleNext = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);
        if (data && name) {
          const formDataInRedux = { ...formData, [name]: data };
          const res = await saveFormInDraft({ formId: form?.data?._id, formData: formDataInRedux }).unwrap();
          if (res.success) {
            const action = await dispatch(updateFormState({ data, name }));
            unwrapResult(action);
          }
        }
        if (currentStep < form?.data?.sections?.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      } finally {
        setLoadingNext(false);
      }
    },
    [currentStep, dispatch, form?.data?._id, form?.data?.sections?.length, formData, saveFormInDraft]
  );
  const handleSubmit = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);
        const res = await formSubmit({ formId: form?.data?._id, formData: { ...formData, [name]: data } }).unwrap();
        if (res.success) {
          toast.success(res.message);
          navigate('/submited-successfully/' + form?.data?._id);
        }
      } catch (error) {
        console.log('error submitting form', error);
        toast.error(error?.data?.message || 'Error while submitting form');
      } finally {
        setLoadingNext(false);
      }
    },
    [form?.data?._id, formData, formSubmit, navigate]
  );
  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        const formDataInRedux = { ...formData, [name]: data };
        const res = await saveFormInDraft({ formId: form?.data?._id, formData: formDataInRedux }).unwrap();
        if (res.success) toast.success(res.message);
      } catch (error) {
        console.log('error while saving form in draft', error);
        toast.error(error?.data?.message || 'Error while saving form in draft');
      }
    },
    [form?.data?._id, formData, saveFormInDraft]
  );

  // get saved data if exist
  useEffect(() => {
    if (form?.data?.sections && form?.data?.sections?.length > 0) {
      getSavedFormData({ formId: form?.data?._id })
        .then(res => {
          const data = res?.data?.data?.savedData;
          dispatch(setIdMissionData(data?.idMission));
          if (data) dispatch(addSavedFormData(data));
        })
        .finally(() => setIsSavedApiRun(true));
    }
  }, [dispatch, form, getSavedFormData]);

  useEffect(() => {
    if (form?.data?.sections && form?.data?.sections?.length > 0 && isSavedApiRun) {
      const data = [];
      const stepNames = [];
      form?.data?.sections?.forEach(step => {
        const sectionDataFromRedux = formData?.[step?.title];

        const commonProps = {
          _id: step._id,
          name: step.name,
          title: step.title,
          fields: step?.fields ?? [],
          blocks: step?.blocks ?? [],
          isSignature: step?.isSignature,
          reduxData: sectionDataFromRedux,
          currentStep,
          totalSteps: form?.data?.sections?.length,
          handleNext,
          handlePrevious,
          handleSubmit,
          formLoading,
          formRefetch,
          saveInProgress,
          step,
        };
        if (step.title === 'company_information_blk') {
          data.push(<CompanyInformation {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === 'beneficial_blk') {
          data.push(<CompanyOwners {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === 'bank_account_info_blk') {
          data.push(<BankInfo {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === 'avg_transactions_blk') {
          data.push(<ProcessingInfo {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === 'incorporation_article_blk') {
          data.push(<Documents {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === 'custom_section') {
          data.push(<CustomSection {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === 'aggrement_blk') {
          data.push(<AggrementBlock {...commonProps} />);
          stepNames.push(step.name);
        }
      });
      setStepsComps(data);
      setSectionNames(stepNames);
    }
  }, [
    currentStep,
    fileData,
    form?.data?.sections,
    formData,
    formLoading,
    formRefetch,
    handleNext,
    handlePrevious,
    handleSubmit,
    isSavedApiRun,
    saveInProgress,
  ]);
  if (!isApplied || !form?.data?._id) return <CustomLoading />;
  if (!user?._id) return navigate(`/application-form/${formId}`);
  return (
    <div className="h-full w-full overflow-hidden rounded-[10px] bg-white px-6 py-6">
      <Stepper steps={sectionNames} currentStep={currentStep} visibleSteps={0} emptyRequiredFields={[]}>
        {stepsComps[currentStep]}
      </Stepper>
    </div>
  );
}
