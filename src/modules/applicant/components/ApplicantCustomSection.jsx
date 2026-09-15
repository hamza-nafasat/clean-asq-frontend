import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useApplicantSectionIdMission from "@/hooks/useApplicantSectionIdMission";
import { useEnterToNextField } from "@/hooks/useEnterToNextField";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import CustomizationFieldsModal from "./ApplicantCustomizeFieldsModal";
import DisplayText from "./ApplicantDisplayText";
import ApplicantIdMissionQrPanel from "./ApplicantIdMissionQrPanel";
import ApplicantSectionField from "./ApplicantSectionField";
import { EditSectionDisplayTextFromatingModal } from "./ApplicantSectionTextModal";
import { FIELD_BLOCK_TYPE, FIELD_NAMES } from "../utils/applicant.constants";
import { isCustomSectionValueFilled, uploadSignatureReplacing } from "../utils/applicant.utils12";
import { isNotGuestRoleValue } from "@/utils/permissions";
import { getSignatureUrl, isSignatureComplete, normalizeFieldEntry, normalizeSignature } from "@/utils/signatureShape";

const CustomSection = ({
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
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
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

  const requiredNames = useMemo(
    () => fields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId, type: f.type })),
    [fields],
  );
  const isCreator = user?._id && user?._id === step?.owner && isNotGuestRoleValue(user);
  // creators can always continue
  const isAllRequiredFieldsFilled =
    isCreator ||
    (requiredNames.every(({ uniqueId, type }) => isCustomSectionValueFilled(form[uniqueId]?.value, type)) &&
      (!isSignature || isSignatureComplete(form?.signature)));
  const isActionDisabled = !isAllRequiredFieldsFilled || loadingNext;
  const actionClassName = isActionDisabled ? "pointer-events-none cursor-not-allowed opacity-20" : "";

  const handleSignatureUpload = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");
      const { res, errorMessage } = await uploadSignatureReplacing(file, form?.signature?.value);
      if (errorMessage) return toast.error(errorMessage);
      setForm((prev) => ({ ...prev, signature: { name: FIELD_NAMES.SIGNATURE, value: res } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
    } finally {
      setIsSaving?.(false);
    }
  };

  // IDMission values win over the saved draft
  useEffect(() => {
    if (fields?.length) {
      const formFields = {};
      fields.forEach((field) => {
        const idMissionValue = idMissionVerifiedData?.[field?.name]?.value;
        formFields[field?.uniqueId] =
          idMissionValue !== undefined
            ? { name: field?.name, value: idMissionValue }
            : normalizeFieldEntry(reduxData?.[field?.uniqueId], field?.name);
      });
      setForm(formFields);
    }
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, idMissionVerifiedData, isSignature, reduxData]);

  useEffect(() => {
    if (step?.isIdMissionQr) loadQrCode();
  }, [loadQrCode, step?.isIdMissionQr]);

  submitFromEnterRef.current = () => {
    if (isActionDisabled) return;
    if (currentStep < totalSteps - 1) handleNext({ data: form, name: sectionKey, setLoadingNext });
    else handleSubmit({ data: form, name: sectionKey, setLoadingNext });
  };
  useEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  return (
    <div ref={formContainerRef} className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label="Save my progress" />
        {isCreator && (
          <>
            <Button variant="secondary" onClick={() => setCustomizeModal(true)} label="Customize" />
            <Button onClick={() => setUpdateSectionFromatingModal(true)} label="Update Display Text" />
          </>
        )}
      </div>

      {updateSectionFromatingModal && (
        <Modal onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}
      {(step?.ai_formatting || step?.displayText) && (
        <div className="flex w-full items-end justify-between gap-3">
          <DisplayText className="mt-2 mb-4 w-full" html={step?.ai_formatting || step?.displayText} />
        </div>
      )}
      {step?.isIdMissionQr && (
        <ApplicantIdMissionQrPanel
          qrCode={qrCode}
          isProcessing={isIdMissionProcessing}
          setIsProcessing={setIsIdMissionProcessing}
          isRefreshDisabled={isQrLoading || isSessionLoading}
          onRefresh={getQrAndWebLink}
        />
      )}
      <div className="mt-6 flex flex-col gap-4">
        {fields?.map((field, index) =>
          field.name === FIELD_NAMES.MAIN_OWNER_25_PERCENT || field.type === FIELD_BLOCK_TYPE ? null : (
            <ApplicantSectionField key={index} field={field} form={form} setForm={setForm} />
          ),
        )}
      </div>
      <div className="mt-4">
        {isSignature && (
          <>
            {step?.signDisplayFormattedText && (
              <div
                className="mb-4"
                data-ai-display-text
                dangerouslySetInnerHTML={{ __html: String(step.signDisplayFormattedText) }}
              />
            )}
            <SignatureBox step={step} onSave={handleSignatureUpload} oldSignatureUrl={getSignatureUrl(form?.signature)} />
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && (
            <Button variant="secondary" label="Previous" onClick={handlePrevious} data-testid="form-back-btn" />
          )}
          {currentStep < totalSteps - 1 ? (
            <Button
              disabled={isActionDisabled}
              className={actionClassName}
              label={!isAllRequiredFieldsFilled ? "Some required fields are missing" : "Next"}
              data-testid="form-next-btn"
              onClick={() => {
                if (!isCreator && !isAllRequiredFieldsFilled) return;
                handleNext({ data: form, name: sectionKey, setLoadingNext });
              }}
            />
          ) : (
            <Button
              disabled={isActionDisabled}
              className={actionClassName}
              label={!isAllRequiredFieldsFilled ? "Some required fields are missing" : "Submit"}
              data-testid="form-submit-btn"
              onClick={() => {
                if (!isCreator && !isAllRequiredFieldsFilled) return;
                handleSubmit({ data: form, name: sectionKey, setLoadingNext });
              }}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={_id}
            suggestions={Object.keys(idMissionVerifiedData)}
            fields={fields}
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
            section={step}
          />
        </Modal>
      )}
    </div>
  );
};

export default CustomSection;
