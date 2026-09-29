import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import usePermission from "@/hooks/usePermission";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import ApplicantCustomizeFieldsModal from "./ApplicantCustomizeFieldsModal";
import ApplicantDisplayText from "./ApplicantDisplayText";
import ApplicantSectionField from "./ApplicantSectionField";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantStepActions from "./ApplicantStepActions";
import { buildSignatureUploadHandler } from "../utils/applicant.signature.utils";
import { isProcessingInfoComplete } from "../utils/applicant.validation.utils";
import { PERMISSIONS } from "@/utils/permissions";
import { normalizeSignature } from "@/utils/signatureShape";

// a field's answers plus its "field/subfield" follow-ups
const buildProcessingForm = (fields, reduxData) => {
  const initialForm = {};
  fields.forEach((field) => {
    initialForm[field.uniqueId] = { name: field.name, value: reduxData?.[field.uniqueId]?.value || "" };
    field.conditional_fields?.forEach((conditionalField) => {
      const key = `${field.uniqueId}/${conditionalField?.name}`;
      initialForm[key] = { name: conditionalField?.name || key, value: reduxData?.[key]?.value ?? "" };
    });
  });
  return initialForm;
};

const ApplicantProcessingInfo = ({
  sectionKey,
  name,
  handleNext,
  handlePrevious,
  currentStep = 0,
  totalSteps = 0,
  handleSubmit,
  formLoading = false,
  fields = [],
  reduxData,
  formRefetch,
  _id,
  saveInProgress,
  step = {},
  isSignature = false,
}) => {
  const { user } = useSelector((state) => state.auth);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);

  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const isOwner = Boolean(user?._id) && user?._id === step?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const isComplete = isOwner || isProcessingInfoComplete({ form, fields, isSignature });
  const isBusy = loadingNext || formLoading;
  const stepAction = { data: form, name: sectionKey, setLoadingNext };

  const handleSignatureUpload = buildSignatureUploadHandler({ form, setForm });

  useEffect(() => {
    if (fields.length > 0) setForm(buildProcessingForm(fields, reduxData));
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, isSignature, reduxData]);

  submitFromEnterRef.current = () => {
    if (!isComplete || isBusy) return;
    if (currentStep < totalSteps - 1) handleNext(stepAction);
    else handleSubmit(stepAction);
  };
  useApplicantEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  return (
    <section ref={formContainerRef} className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <header className="mb-10 flex items-center justify-between">
        <h2 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
          {name}
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label="Save my progress" />
          {canCustomize && (
            <>
              <Button variant="secondary" onClick={() => setIsCustomizeModalOpen(true)} label="Customize" />
              <Button onClick={() => setIsSectionTextModalOpen(true)} label="Update Display Text" />
            </>
          )}
        </div>
      </header>
      {isSectionTextModalOpen && (
        <Modal onClose={() => setIsSectionTextModalOpen(false)}>
          <ApplicantSectionTextModal section={step} onClose={() => setIsSectionTextModalOpen(false)} />
        </Modal>
      )}
      {(step?.ai_formatting || step?.displayText) && (
        <ApplicantDisplayText className="mb-4" data-ai-display-text html={step?.ai_formatting || step?.displayText} />
      )}
      {fields.map((field) => (
        <ApplicantSectionField key={field.uniqueId} field={field} form={form} setForm={setForm} />
      ))}
      {isSignature && (
        <div className="mt-4">
          <SignatureBox step={step} onSave={handleSignatureUpload} signature={form?.signature} />
        </div>
      )}

      <ApplicantStepActions
        currentStep={currentStep}
        totalSteps={totalSteps}
        isComplete={isComplete}
        isBusy={isBusy}
        incompleteLabel="Some Required Fields are Missing"
        onPrevious={handlePrevious}
        onNext={() => handleNext(stepAction)}
        onSubmit={() => handleSubmit(stepAction)}
      />
      {isCustomizeModalOpen && (
        <Modal onClose={() => setIsCustomizeModalOpen(false)}>
          <ApplicantCustomizeFieldsModal
            sectionId={_id}
            fields={fields}
            section={step}
            formRefetch={formRefetch}
            onClose={() => setIsCustomizeModalOpen(false)}
          />
        </Modal>
      )}
    </section>
  );
};

export default ApplicantProcessingInfo;
