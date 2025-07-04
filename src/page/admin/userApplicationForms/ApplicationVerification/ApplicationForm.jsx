import BankInfo from '@/components/applicationVerification/BankInfo';
import CompanyInformation from '@/components/applicationVerification/CompanyInformation';
import CompanyOwners from '@/components/applicationVerification/CompanyOwners';
import CustomSection from '@/components/applicationVerification/CustomSection';
import Documents from '@/components/applicationVerification/Documents';
import ProcessingInfo from '@/components/applicationVerification/ProcessingInfo';
import Verification from '@/components/applicationVerification/Verification';
import { useCallback, useEffect, useState } from 'react';
import Stepper from '../../../../components/Stepper/Stepper';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormState } from '@/redux/slices/formSlice';
import { useSubmitFormArticleFileMutation, useSubmitFormMutation } from '@/redux/apis/formApis';
import { toast } from 'react-toastify';
import { unwrapResult } from '@reduxjs/toolkit';

export default function ApplicationForm({ form }) {
  const dispatch = useDispatch();
  const { formData, fileData } = useSelector(state => state?.form);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionNames, setSectionNames] = useState([]);
  const [stepsComps, setStepsComps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmit] = useSubmitFormMutation();
  const [submitArticle] = useSubmitFormArticleFileMutation();

  const handleComplete = () => {
    console.log('Form submitted:');
  };

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
      if (currentStep < form?.sections?.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    },
    [currentStep, dispatch, form?.sections?.length]
  );

  const handleSubmit = useCallback(
    async ({ data, name }) => {
      try {
        setIsLoading(true);
        const res = await formSubmit({ formId: form?._id, formData: { ...formData, [name]: data } }).unwrap();
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
    [fileData?.file, fileData?.name, form?._id, formData, formSubmit, submitArticle]
  );

  useEffect(() => {
    if (form?.sections && form?.sections?.length > 0) {
      const data = [];
      const stepNames = [];
      form?.sections?.forEach(step => {
        const sectionDataFromRedux = formData?.[step?.name];
        if (step.title === 'id_verification_blk') {
          data.push(
            <Verification
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
              formLoading={isLoading}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'company_information_blk') {
          data.push(
            <CompanyInformation
              reduxData={sectionDataFromRedux}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
              formLoading={isLoading}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'beneficial_blk') {
          data.push(
            <CompanyOwners
              reduxData={sectionDataFromRedux}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
              formLoading={isLoading}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'bank_account_info_blk') {
          data.push(
            <BankInfo
              reduxData={sectionDataFromRedux}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
              formLoading={isLoading}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'avg_transactions_blk') {
          data.push(
            <ProcessingInfo
              reduxData={sectionDataFromRedux}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
              formLoading={isLoading}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'incorporation_article_blk') {
          data.push(
            <Documents
              reduxData={sectionDataFromRedux}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
              formLoading={isLoading}
            />
          );
          stepNames.push(step.name);
        } else if (step.title == 'custom_section') {
          data.push(
            <CustomSection
              reduxData={sectionDataFromRedux}
              fields={step.fields}
              name={step.name}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
              formLoading={isLoading}
            />
          );
          stepNames.push(step.name);
        }
      });
      console.log('steps', data);
      setStepsComps(data);
      setSectionNames(stepNames);
    }
  }, [currentStep, form?.sections, formData, formData.sections, handleNext, handlePrevious, handleSubmit, isLoading]);
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
