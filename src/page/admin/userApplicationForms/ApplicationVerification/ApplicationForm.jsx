import BankInfo from '@/components/applicationVerification/BankInfo';
import CompanyInformation from '@/components/applicationVerification/CompanyInformation';
import CompanyOwners from '@/components/applicationVerification/CompanyOwners';
import CustomSection from '@/components/applicationVerification/CustomSection';
import Documents from '@/components/applicationVerification/Documents';
import ProcessingInfo from '@/components/applicationVerification/ProcessingInfo';
import Verification from '@/components/applicationVerification/Verification';
import { useEffect, useState } from 'react';
import Stepper from '../../../../components/Stepper/Stepper';

export default function ApplicationForm({ form }) {
  const [sectionNames, setSectionNames] = useState([]);
  const [stepsComps, setStepsComps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const handleComplete = () => {
    console.log('Form submitted:');
  };

  useEffect(() => {
    if (form?.sections && form?.sections?.length > 0) {
      const data = [];
      const stepNames = [];
      form?.sections?.forEach(step => {
        if (step.title === 'id_verification_blk') {
          data.push(<Verification />);
          stepNames.push(step.name);
        } else if (step.title === 'company_information_blk') {
          data.push(<CompanyInformation />);
          stepNames.push(step.name);
        } else if (step.title === 'beneficial_blk') {
          data.push(<CompanyOwners />);
          stepNames.push(step.name);
        } else if (step.title === 'bank_account_info_blk') {
          data.push(<BankInfo />);
          stepNames.push(step.name);
        } else if (step.title === 'avg_transactions_blk') {
          data.push(<ProcessingInfo />);
          stepNames.push(step.name);
        } else if (step.title === 'incorporation_article_blk') {
          data.push(<Documents />);
          stepNames.push(step.name);
        } else if (step.title == 'custom_section') {
          data.push(<CustomSection fields={step.fields} name={step.name} />);
          stepNames.push(step.name);
        }
      });
      console.log('steps', data);
      setStepsComps(data);
      setSectionNames(stepNames);
    }
  }, [form?.sections]);
  return (
    <div className="h-full w-full rounded-[10px] bg-white px-6 py-6">
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
