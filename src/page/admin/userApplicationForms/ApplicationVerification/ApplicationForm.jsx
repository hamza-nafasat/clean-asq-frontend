import AggrementBlock from '@/components/applicationVerification/AggrementBlock';
import BankInfo from '@/components/applicationVerification/BankInfo';
import CompanyInformation from '@/components/applicationVerification/CompanyInformation';
import CompanyOwners from '@/components/applicationVerification/CompanyOwners';
import CustomSection from '@/components/applicationVerification/CustomSection';
import Documents from '@/components/applicationVerification/Documents';
import ProcessingInfo from '@/components/applicationVerification/ProcessingInfo';
import CustomLoading from '@/components/shared/small/CustomLoading';
import useApplyBranding from '@/hooks/useApplyBranding';
import {
  useGetSavedFormMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useSubmitFormMutation,
} from '@/redux/apis/formApis';
import { setIdMissionData } from '@/redux/slices/authSlice';
import { addSavedFormData, updateFormHeaderAndFooter, updateFormState } from '@/redux/slices/formSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Stepper from '../../../../components/Stepper/Stepper';
import { uploadFilesAndReplace } from '@/lib/utils';

export default function ApplicationForm() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const dispatch = useDispatch();
  const { formData } = useSelector(state => state?.form);

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
          const updatedData = await uploadFilesAndReplace(data);
          // Update Redux state
          const res = await saveFormInDraft({
            formId: form?.data?._id,
            formData: { ...formData, [name]: updatedData },
          }).unwrap();

          if (res.success) {
            const action = await dispatch(updateFormState({ data: updatedData, name }));
            unwrapResult(action);
          }
        }
      } catch (error) {
        console.log('error while handling next', error);
        toast.error(error?.data?.message || 'Error while handling next');
      } finally {
        // Move to next step
        if (currentStep < form?.data?.sections?.length - 1)
          setCurrentStep(currentStep + 1);
        setLoadingNext(false);
      }
    },
    [currentStep, dispatch, form?.data?._id, form?.data?.sections?.length, formData, saveFormInDraft]
  );
  const handleSubmit = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);

        if (data && name) {
          const updatedData = await uploadFilesAndReplace(data);
          // Save form draft (non-file data only)
          const res = await formSubmit({ formId: form?.data?._id, formData: { ...formData, [name]: updatedData } }).unwrap();
          if (res.success) {
            toast.success(res.message);
            navigate('/submited-successfully/' + form?.data?._id);
          }
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
        if (data && name) {
          const updatedData = await uploadFilesAndReplace(data);
          const res = await saveFormInDraft({ formId: form?.data?._id, formData: { ...formData, [name]: updatedData } }).unwrap();
          if (res.success) toast.success(res.message);
        }
      } catch (error) {
        console.log('error while saving form in draft', error);
        toast.error(error?.data?.message || 'Error while saving form in draft');
      }
    },
    [form?.data?._id, formData, saveFormInDraft]
  );

  useEffect(() => {
    // get saved data if exist
    if (form?.data?.sections && form?.data?.sections?.length > 0) {
      getSavedFormData({ formId: form?.data?._id })
        .then(res => {
          const data = res?.data?.data?.savedData;
          dispatch(setIdMissionData(data?.idMission));
          if (data) dispatch(addSavedFormData(data));
        })
        .finally(() => setIsSavedApiRun(true));
    }
    // add footer and header text in state
    if (form?.data?.footerText || form?.data?.headerText || form?.data?.name) {
      dispatch(
        updateFormHeaderAndFooter({
          headerText: form?.data?.headerText || form?.data?.name || '',
          footerText: form?.data?.footerText || 'All rights reserved',
        })
      );
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ headerText: '', footerText: 'All rights reserved' }));
    };
  }, [dispatch, form, getSavedFormData]);

  useEffect(() => {
    if (form?.data?.sections && form?.data?.sections?.length > 0 && isSavedApiRun) {
      const companyInformationStep = form?.data?.sections.find(step => step.key === 'company_information');
      const data = [];
      const stepNames = [];
      const isOwner = user?._id && user?._id === form?.data?.owner;
      const visibleSections = isOwner ? form?.data?.sections : form?.data?.sections?.filter(step => !step?.isHidden);
      visibleSections.forEach(step => {
        const sectionDataFromRedux = formData?.[step?.key];
        const commonProps = {
          _id: step._id,
          sectionKey: step.key || 'hello',
          name: step.name,
          title: step.title,
          fields: step?.fields ?? [],
          blocks: step?.blocks ?? [],
          isSignature: step?.isSignature,
          reduxData: sectionDataFromRedux,
          currentStep,
          totalSteps: visibleSections?.length,
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
          data.push(<Documents {...commonProps} companyInformationStep={companyInformationStep} />);
          stepNames.push(step.name);
        } else if (step.title === 'custom_section') {
          data.push(<CustomSection {...commonProps} />);
          stepNames.push(step.name);
        } else if (step.title === 'agreement_blk') {
          data.push(<AggrementBlock {...commonProps} />);
          stepNames.push(step.name);
        }
      });
      setStepsComps(data);
      setSectionNames(stepNames);
    }
  }, [
    currentStep, form?.data?.owner,
    form?.data?.sections,
    formData,
    formLoading,
    formRefetch,
    handleNext,
    handlePrevious,
    handleSubmit,
    isSavedApiRun,
    saveInProgress,
    user?._id,
  ]);
  if (!isApplied || !form?.data?._id) return <CustomLoading />;
  if (!user?._id) return navigate(`/application-form/${form?.data?.branding?.name}/${formId}`);
  return (
    <div className="bg-backgroundColor h-full w-full overflow-hidden rounded-[10px] px-6 py-6">
      <Stepper steps={sectionNames} currentStep={currentStep} visibleSteps={0} emptyRequiredFields={[]}>
        {stepsComps[currentStep]}
      </Stepper>
    </div>
  );
}
