import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFormState } from "@/redux/slices/form.slice";
import usePermission from "@/hooks/usePermission";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import HtmlContent from "@/components/shared/HtmlContent";
import Modal from "@/components/shared/Modal";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import ApplicantCustomizeFieldsModal from "./ApplicantCustomizeFieldsModal";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantStepActions from "./ApplicantStepActions";
import { buildSignatureUploadHandler } from "../utils/applicant.signature.utils";
import { isRequiredValueFilled } from "../utils/applicant.validation.utils";
import { PERMISSIONS } from "@/utils/permissions";
import { isSignatureComplete, normalizeFieldEntry, normalizeSignature } from "@/utils/signatureShape";

const ApplicantAgreementBlock = ({
  sectionKey,
  fields = [],
  name,
  currentStep = 0,
  totalSteps = 0,
  handleNext,
  handlePrevious,
  handleSubmit,
  formRefetch,
  _id,
  saveInProgress,
  step = {},
  isSignature = false,
  reduxData,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state.form);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);

  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const isOwner = Boolean(user?._id) && user?._id === step?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const isComplete =
    isOwner ||
    (fields.filter((f) => f.required).every(({ uniqueId }) => isRequiredValueFilled(form[uniqueId]?.value)) &&
      (!isSignature || isSignatureComplete(form?.signature)));
  const stepAction = { data: form, name: sectionKey, setLoadingNext };

  // the signature is saved at once, merged so other answers stay
  const handleSignatureUpload = buildSignatureUploadHandler({
    form,
    setForm,
    onUploaded: async (signature) => {
      dispatch(updateFormState({ data: { ...(formData?.[sectionKey] || {}), ...form, signature }, name: sectionKey }));
      await saveInProgress({ data: { signature }, name: sectionKey });
    },
  });

  useEffect(() => {
    if (fields.length) {
      const formFields = {};
      fields.forEach((field) => {
        formFields[field.uniqueId] = normalizeFieldEntry(
          reduxData?.[field.uniqueId] ?? reduxData?.[field.name],
          field.name,
        );
      });
      setForm(formFields);
    }
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, isSignature, reduxData]);

  submitFromEnterRef.current = () => {
    if (!isComplete || loadingNext) return;
    if (currentStep < totalSteps - 1) handleNext(stepAction);
    else handleSubmit(stepAction);
  };
  useApplicantEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  return (
    <section ref={formContainerRef} className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h2 className="text-textPrimary mb-10 text-2xl font-semibold" data-ai-display-text>
        {name}
      </h2>
      <div className="flex justify-end gap-2">
        <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label="Save my progress" />
        {canCustomize && (
          <>
            <Button variant="secondary" onClick={() => setIsCustomizeModalOpen(true)} label="Customize" />
            <Button onClick={() => setIsSectionTextModalOpen(true)} label="Update Display Text" />
          </>
        )}
      </div>
      {isSectionTextModalOpen && (
        <Modal onClose={() => setIsSectionTextModalOpen(false)}>
          <ApplicantSectionTextModal section={step} onClose={() => setIsSectionTextModalOpen(false)} />
        </Modal>
      )}

      {(step?.ai_formatting || step?.displayText) && (
        <HtmlContent
          className="mt-2 mb-4 w-full"
          data-ai-display-text
          html={String(step?.ai_formatting || step?.displayText || "")}
          linkMode="documentModal"
        />
      )}
      {isSignature && (
        <div className="mt-4">
          {step?.signDisplayFormattedText && (
            <HtmlContent
              className="mb-4"
              data-ai-display-text
              html={String(step.signDisplayFormattedText)}
              linkMode="documentModal"
            />
          )}
          <SignatureBox step={step} onSave={handleSignatureUpload} signature={form?.signature} />
        </div>
      )}

      <ApplicantStepActions
        currentStep={currentStep}
        totalSteps={totalSteps}
        isComplete={isComplete}
        isBusy={loadingNext}
        onPrevious={handlePrevious}
        onNext={() => handleNext(stepAction)}
        onSubmit={() => handleSubmit(stepAction)}
      />
      {isCustomizeModalOpen && (
        <Modal onClose={() => setIsCustomizeModalOpen(false)}>
          <ApplicantCustomizeFieldsModal
            sectionId={_id}
            fields={[]}
            isArticleForm
            formRefetch={formRefetch}
            onClose={() => setIsCustomizeModalOpen(false)}
            section={step}
          />
        </Modal>
      )}
    </section>
  );
};

export default ApplicantAgreementBlock;
