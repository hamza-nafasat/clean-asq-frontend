import BankInfo from '@/components/applicationVerification/BankInfo';
import CompanyInformation from '@/components/applicationVerification/CompanyInformation';
import CompanyOwners from '@/components/applicationVerification/CompanyOwners';
import CustomSection from '@/components/applicationVerification/CustomSection';
import Documents from '@/components/applicationVerification/Documents';
import ProcessingInfo from '@/components/applicationVerification/ProcessingInfo';

import { useCallback, useEffect, useState } from 'react';
import Stepper from '../../../../components/Stepper/Stepper';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormState } from '@/redux/slices/formSlice';
import {
  useGetSingleFormQueryQuery,
  useSubmitFormArticleFileMutation,
  useSubmitFormMutation,
} from '@/redux/apis/formApis';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';
import CustomLoading from '@/components/shared/small/CustomLoading';

export default function ApplicationForm({ selectedForm }) {
  const dispatch = useDispatch();
  const { formData, fileData } = useSelector(state => state?.form);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionNames, setSectionNames] = useState([]);
  const [stepsComps, setStepsComps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmit] = useSubmitFormMutation();
  const [submitArticle] = useSubmitFormArticleFileMutation();
  const {
    data: form,
    isLoading: formLoading,
    refetch: formRefetch,
  } = useGetSingleFormQueryQuery({ _id: selectedForm._id });
  const handleComplete = () => console.log('Form submitted:');
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleNext = useCallback(
    async ({ data, name }) => {
      if (data && name) {
        const action = await dispatch(updateFormState({ data, name }));
        unwrapResult(action);
      }
      if (currentStep < form?.data?.sections?.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    },
    [currentStep, dispatch, form?.data?.sections?.length]
  );

  const handleSubmit = useCallback(
    async ({ data, name }) => {
      try {
        setIsLoading(true);
        const res = await formSubmit({ formId: form?.data?._id, formData: { ...formData, [name]: data } }).unwrap();
        if (res.success) {
          const formDataStructure = new FormData();
          formDataStructure.append('submissionId', res?.data?._id);
          formDataStructure.append('file', fileData?.file);
          formDataStructure.append('name', fileData?.name);
          const resp = await submitArticle(formDataStructure).unwrap();
          if (resp.success) toast.success(res.message);
        }
      } catch (error) {
        console.log('error submitting form', error);
        toast.error(error?.data?.message || 'Error while submitting form');
      } finally {
        setIsLoading(false);
      }
    },
    [fileData?.file, fileData?.name, form?.data?._id, formData, formSubmit, submitArticle]
  );

  useEffect(() => {
    if (form?.data?.sections && form?.data?.sections?.length > 0) {
      const data = [];
      const stepNames = [];
      form?.data?.sections?.forEach(step => {
        const sectionDataFromRedux = formData?.[step?.name];
        const commonProps = {
          _id: step._id,
          name: step.name,
          fields: step?.fields ?? [],
          blocks: step?.blocks ?? [],
          reduxData: sectionDataFromRedux,
          currentStep,
          totalSteps: form?.data?.sections?.length,
          handleNext,
          handlePrevious,
          handleSubmit,
          formLoading,
          formRefetch,
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
          data.push(<Documents {...commonProps} reduxData={fileData} />);
          stepNames.push(step.name);
        } else if (step.title === 'custom_section') {
          data.push(<CustomSection {...commonProps} isLoading={isLoading} />);
          stepNames.push(step.name);
        }
        // else if (step.title === 'id_verification_blk') {
        //   data.push(<Verification {...commonProps} />);
        //   stepNames.push(step.name);
        // }
      });
      console.log('steps', data);
      setStepsComps(data);
      setSectionNames(stepNames);
    }
  }, [
    form,
    formData,
    fileData,
    currentStep,
    isLoading,
    formLoading,
    handleNext,
    handlePrevious,
    handleSubmit,
    formRefetch,
  ]);

  if (!form?.data?._id) return <CustomLoading />;

  return (
    <div className="overflow-none h-full w-full rounded-[10px] bg-white px-6 py-6">
      <Stepper
        steps={sectionNames}
        currentStep={currentStep}
        onStepChange={step => setCurrentStep(step)}
        onComplete={handleComplete}
        visibleSteps={0}
        Children={stepsComps[currentStep]}
      />
    </div>
  );
}
