import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import usePermission from "@/hooks/usePermission";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import HtmlContent from "@/components/shared/HtmlContent";
import Modal from "@/components/shared/Modal";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import useApplicantSectionIdMission from "../hooks/useApplicantSectionIdMission";
import ApplicantCustomizeFieldsModal from "./ApplicantCustomizeFieldsModal";
import ApplicantDisplayText from "./ApplicantDisplayText";
import ApplicantIdMissionQrPanel from "./ApplicantIdMissionQrPanel";
import ApplicantSectionField from "./ApplicantSectionField";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantStepActions from "./ApplicantStepActions";
import { FIELD_NAMES, FORM_BLOCK_TYPE } from "@/constants";
import { buildSignatureUploadHandler } from "../utils/applicant.signature.utils";
import { isCustomSectionValueFilled } from "../utils/applicant.validation.utils";
import { PERMISSIONS } from "@/utils/permissions";
import { isSignatureComplete, normalizeFieldEntry, normalizeSignature } from "@/utils/signatureShape";

const ApplicantCustomSection = ({
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
  reduxData,
  isSignature = false,
}) => {
  const { user } = useSelector((state) => state.auth);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
  const {
    idMissionVerifiedData,
    qrCode,
    isQrLoading,
    isSessionLoading,
    isIdMissionProcessing,
    setIsIdMissionProcessing,
    getQrAndWebLink,
    loadQrCode,
  } = useApplicantSectionIdMission(sectionKey);

  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const canUseIdMission = usePermission(PERMISSIONS.ID_MISSION);
  const isOwner = Boolean(user?._id) && user?._id === step?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const showIdMissionQr = step?.isIdMissionQr && canUseIdMission;
  // creators can always continue
  const isComplete =
    isOwner ||
    (fields
      .filter((f) => f.required)
      .every(({ uniqueId, type }) => isCustomSectionValueFilled(form[uniqueId]?.value, type)) &&
      (!isSignature || isSignatureComplete(form?.signature)));
  const stepAction = { data: form, name: sectionKey, setLoadingNext };

  const handleSignatureUpload = buildSignatureUploadHandler({ form, setForm });

  // IDMission values win over the saved draft
  useEffect(() => {
    if (fields.length) {
      const formFields = {};
      fields.forEach((field) => {
        const idMissionValue = idMissionVerifiedData?.[field?.name]?.value;
        formFields[field.uniqueId] =
          idMissionValue !== undefined
            ? { name: field.name, value: idMissionValue }
            : normalizeFieldEntry(reduxData?.[field.uniqueId], field.name);
      });
      setForm(formFields);
    }
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, idMissionVerifiedData, isSignature, reduxData]);

  useEffect(() => {
    if (showIdMissionQr) loadQrCode();
  }, [loadQrCode, showIdMissionQr]);

  submitFromEnterRef.current = () => {
    if (!isComplete || loadingNext) return;
    if (currentStep < totalSteps - 1) handleNext(stepAction);
    else handleSubmit(stepAction);
  };
  useApplicantEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  return (
    <section ref={formContainerRef} className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h2 className="text-textPrimary mb-10 text-2xl font-semibold">{name}</h2>
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
        <ApplicantDisplayText className="mt-2 mb-4 w-full" html={step?.ai_formatting || step?.displayText} />
      )}
      {showIdMissionQr && (
        <ApplicantIdMissionQrPanel
          qrCode={qrCode}
          isProcessing={isIdMissionProcessing}
          setIsProcessing={setIsIdMissionProcessing}
          isRefreshDisabled={isQrLoading || isSessionLoading}
          onRefresh={getQrAndWebLink}
        />
      )}
      <div className="mt-6 flex flex-col gap-4">
        {fields.map((field, index) =>
          field.name === FIELD_NAMES.MAIN_OWNER_OWN_25_PERCENT || field.type === FORM_BLOCK_TYPE ? null : (
            <ApplicantSectionField key={field.uniqueId || index} field={field} form={form} setForm={setForm} />
          ),
        )}
      </div>
      {isSignature && (
        <div className="mt-4">
          {step?.signDisplayFormattedText && (
            <HtmlContent
              className="mb-4"
              data-ai-display-text
              html={String(step.signDisplayFormattedText)}
              linkMode="none"
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
            suggestions={Object.keys(idMissionVerifiedData)}
            fields={fields}
            formRefetch={formRefetch}
            onClose={() => setIsCustomizeModalOpen(false)}
            section={step}
          />
        </Modal>
      )}
    </section>
  );
};

export default ApplicantCustomSection;
