import React, { useState, useMemo } from 'react';
import verificationImg from '../../../../assets/images/verificationImg.png';
import Stepper from '../../../../components/Stepper/Stepper';
import CompanyInformation from '@/components/applicationVerification/CompanyInformation';
import Verification from '@/components/applicationVerification/Verification';
import CompanyOwners from '@/components/applicationVerification/CompanyOwners';
import BankInfo from '@/components/applicationVerification/BankInfo';
import ProcessingInfo from '@/components/applicationVerification/ProcessingInfo';
import ApplicationInfo from '@/components/applicationVerification/ApplicationInfo';
import PlaceHolder from '@/components/applicationVerification/PlaceHolder';
import Documents from '@/components/applicationVerification/Documents';

const steps = [
  'Verification',
  'Company Information',
  'Company Owners',
  'Bank Account Information',
  'Processing Information',
  'Application Information',
  'Documents & Agreements',
  'Placeholders',
];

export default function ApplicationVerification() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState([
    { idType: '', idNumber: '' }, // Verification
    { companyName: '', registrationNumber: '', businessAddress: '' }, // Company Information
    { owners: [{ name: '', percentage: '' }] }, // Company Owners
    { accountNumber: '', bankName: '', branchName: '' }, // Bank Account
    { processingType: '', processingTime: '' }, // Processing Information
    { applicationType: '', applicationPurpose: '' }, // Application Information
    { documents: [], agreementAccepted: false }, // Documents & Agreements
    { Placeholders: '', Placeholders: '' }, // Application Information
  ]);

  const updateField = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleStepChange = step => {
    setCurrentStep(step);
  };

  const handleComplete = () => {
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const stepComponents = useMemo(
    () => [
      <Verification key="verification" data={formData[0]} updateField={updateField} index={0} />,
      <CompanyInformation key="company-info" data={formData[1]} updateField={updateField} index={1} />,
      <CompanyOwners key="company-owners" data={formData[2]} updateField={updateField} index={2} />,
      <BankInfo key="bank-account" data={formData[3]} updateField={updateField} index={3} />,
      <ProcessingInfo key="processing-info" data={formData[4]} updateField={updateField} index={4} />,
      <ApplicationInfo key="application-info" data={formData[5]} updateField={updateField} index={5} />,
      <Documents key="documents" data={formData[6]} updateField={updateField} index={6} />,
      <PlaceHolder key="Placeholders" data={formData[7]} updateField={updateField} index={6} />,
    ],
    [formData]
  );

  return (
    <div className="h-full rounded-[10px] bg-white px-6 py-6">
      {/* Stepper Component */}
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
        visibleSteps={5}
        Children={stepComponents[currentStep]}
      />
    </div>
  );
}
