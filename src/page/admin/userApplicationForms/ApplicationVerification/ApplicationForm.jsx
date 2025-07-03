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

export default function ApplicationForm({ form }) {
  const dispatch = useDispatch();
  const { formData } = useSelector(state => state?.form);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionNames, setSectionNames] = useState([]);
  const [stepsComps, setStepsComps] = useState([]);

  const handleComplete = () => {
    console.log('Form submitted:');
  };
  console.warn('redux form state', formData);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);
  const handleNext = useCallback(
    ({ data, name }) => {
      if (data && name) {
        dispatch(updateFormState({ data, name }));
      }
      if (currentStep < form?.sections?.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    },
    [currentStep, dispatch, form?.sections?.length]
  );
  const handleSubmit = () => {};

  useEffect(() => {
    if (form?.sections && form?.sections?.length > 0) {
      const data = [];
      const stepNames = [];
      form?.sections?.forEach(step => {
        if (step.title === 'id_verification_blk') {
          data.push(
            <Verification
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'company_information_blk') {
          data.push(
            <CompanyInformation
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'beneficial_blk') {
          data.push(
            <CompanyOwners
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'bank_account_info_blk') {
          data.push(
            <BankInfo
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'avg_transactions_blk') {
          data.push(
            <ProcessingInfo
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
            />
          );
          stepNames.push(step.name);
        } else if (step.title === 'incorporation_article_blk') {
          data.push(
            <Documents
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              name={step.name}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
            />
          );
          stepNames.push(step.name);
        } else if (step.title == 'custom_section') {
          data.push(
            <CustomSection
              fields={step.fields}
              name={step.name}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              handleSubmit={handleSubmit}
              currentStep={currentStep}
              totalSteps={form?.sections?.length}
            />
          );
          stepNames.push(step.name);
        }
      });
      console.log('steps', data);
      setStepsComps(data);
      setSectionNames(stepNames);
    }
  }, [currentStep, form?.sections, handleNext, handlePrevious]);
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
