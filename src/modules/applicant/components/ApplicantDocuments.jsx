import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useFormateTextInMarkDownMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { useEnterToNextField } from "../hooks/useEnterToNextField";
import { OtherInputType } from "@/components/global/DynamicField";
import FileUploader from "@/components/global/FileUploader";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import ApplicantAiPromptModal from "./ApplicantAiPromptModal";
import CustomizationFieldsModal from "./ApplicantCustomizeFieldsModal";
import DisplayText from "./ApplicantDisplayText";
import ApplicantRequiredDocsNotice from "./ApplicantRequiredDocsNotice";
import { EditSectionDisplayTextFromatingModal } from "./ApplicantSectionTextModal";
import { FIELD_TYPES } from "@/constants";
import { FIELD_NAMES, SECTION_KEYS } from "../utils/applicant.constants";
import { buildDocumentsAiPrompt, parseDocumentUrls } from "../utils/applicant.utils8";
import { areDocumentsComplete, uploadSignatureReplacing } from "../utils/applicant.utils12";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { isNotGuestRoleValue } from "@/utils/permissions";
import { getSignatureUrl, normalizeFieldEntry, normalizeSignature } from "@/utils/signatureShape";

const Documents = ({
  sectionKey,
  _id,
  name,
  currentStep = 0,
  totalSteps = 0,
  handleNext,
  handlePrevious,
  handleSubmit,
  formLoading = false,
  fields = [],
  reduxData,
  formRefetch,
  step = {},
  isSignature = false,
  companyInformationStep,
  saveInProgress,
}) => {
  const { formData } = useSelector((state) => state.form);
  const { user } = useSelector((state) => state.auth);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [aiPromptModal, setAiPromptModal] = useState(false);
  const [file, setFile] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [form, setForm] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showRequiredDocs, setShowRequiredDocs] = useState(true);
  const [formateTextInMarkDown] = useFormateTextInMarkDownMutation();

  const isCreator = user?._id && user?._id === step?.owner && isNotGuestRoleValue(user);
  const requiredNames = useMemo(
    () => fields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId, type: f.type })),
    [fields],
  );
  const fileField = fields.filter((field) => field.type === FIELD_TYPES.FILE).at(-1);
  const fileFieldName = fileField?.name ?? "";
  const fileFieldUniqueId = fileField?.uniqueId ?? "";
  const urlsFieldId = Object.keys(form)?.find((key) => key?.includes(FIELD_NAMES.ARTICLE_URLS_PART));
  const urls = parseDocumentUrls(form?.[urlsFieldId]?.value ?? form?.[urlsFieldId]);
  // creators can always continue
  const isAllRequiredFilled =
    isCreator || areDocumentsComplete({ form, requiredNames, hasNewFile: !!file || urls.length > 0, isSignature });
  const isActionDisabled = loadingNext || !isAllRequiredFilled;

  const handleSignatureUpload = async (signatureFile, setIsSaving) => {
    try {
      if (!signatureFile) return toast.error("Please select a file");
      const { res, errorMessage } = await uploadSignatureReplacing(signatureFile, form?.signature?.value);
      if (errorMessage) return toast.error(errorMessage);
      setForm((prev) => ({ ...prev, signature: { name: FIELD_NAMES.SIGNATURE, value: res } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
    } finally {
      setIsSaving?.(false);
    }
  };

  const generateAiPrompt = useCallback(
    () => buildDocumentsAiPrompt(formData?.company_information || {}, step?.aiCustomizablePrompt || ""),
    [formData?.company_information, step?.aiCustomizablePrompt],
  );

  // check a file, a url or a stored file exists; returns false to stop
  const canContinue = (oldFileData) => {
    if (!file && !urls.length && (!oldFileData?.publicId || !oldFileData?.secureUrl) && !isCreator) {
      toast.error("Please select a file or Enter a URL");
      return false;
    }
    return true;
  };

  // replace the stored file with the selected one
  const uploadSelectedFile = async (oldFileData) => {
    if (oldFileData?.publicId) {
      const deletedFile = await deleteImageFromCloudinary(oldFileData?.publicId, oldFileData?.resourceType);
      if (!deletedFile) return toast.error("File Not Deleted Please Try Again") && null;
    }
    const result = await uploadImageOnCloudinary(file);
    if (!result.publicId || !result.secureUrl) return toast.error("File Not Uploaded Please Try Again") && null;
    return result;
  };

  const handleNextStep = async () => {
    try {
      if (!isCreator && !isAllRequiredFilled) return toast.error("Please fill all required fields");
      setLoadingNext(true);
      if (!fileFieldUniqueId) return toast.error("Please refresh the page once and try again");
      const oldFileData = form?.[fileFieldUniqueId]?.value || form?.[fileFieldUniqueId];
      if (!canContinue(oldFileData)) return;
      if (!file) return handleNext({ data: { ...form }, name: sectionKey, setLoadingNext });
      const result = await uploadSelectedFile(oldFileData);
      if (!result) return;
      handleNext({
        data: { ...form, [fileFieldUniqueId]: { name: fileFieldName, value: result } },
        name: sectionKey,
        setLoadingNext,
      });
    } catch (error) {
      console.error("Upload document error:", error);
      toast.error("Something went wrong while uploading image");
    } finally {
      setLoadingNext(false);
    }
  };

  const handleSubmitStep = async () => {
    if (!isCreator && !isAllRequiredFilled) return toast.error("Please fill all required fields");
    if (!fileFieldName || !fileFieldUniqueId) return toast.error("Please refresh the page once and try again");
    const oldFileData = form?.[fileFieldUniqueId]?.value || form?.[fileFieldUniqueId];
    if (!canContinue(oldFileData)) return;
    if (!file) return handleSubmit({ data: { ...form }, name: sectionKey, setLoadingNext });
    const result = await uploadSelectedFile(oldFileData);
    if (!result) return;
    handleSubmit({
      data: { ...form, [fileFieldUniqueId]: { name: fileFieldName, value: result } },
      name: sectionKey,
      setLoadingNext,
    });
  };

  // AI help on how to find the documents
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      try {
        setIsAiLoading(true);
        const prompt = generateAiPrompt();
        if (!prompt) return;
        const res = await formateTextInMarkDown({ text: prompt }).unwrap();
        if (res?.success) setAiResponse(DOMPurify.sanitize(res.data));
      } catch (error) {
        console.error("Fetch required documents error:", error);
        toast.error("Failed to load document requirements. Please try again later.");
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchRequiredDocuments();
  }, [formateTextInMarkDown, generateAiPrompt]);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach((field) => {
        initialForm[field?.uniqueId] = normalizeFieldEntry(reduxData?.[field?.uniqueId], field?.name);
      });
      setForm(initialForm);
    }
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, isSignature, reduxData]);

  submitFromEnterRef.current = () => {
    if (isActionDisabled) return;
    if (currentStep < totalSteps - 1) handleNextStep();
    else handleSubmitStep();
  };
  useEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  const actionClassName = `${isActionDisabled && "pinter-events-none cursor-not-allowed opacity-20"}`;

  return (
    <div ref={formContainerRef} className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
            {name}
          </h1>
          <div className="flex gap-2">
            {saveInProgress && (
              <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label="Save my progress" />
            )}
            {isCreator && (
              <>
                <Button variant="secondary" onClick={() => setCustomizeModal(true)} label="Customize" />
                <Button onClick={() => setAiPromptModal(true)} label="Customize Prompt" />
                <Button onClick={() => setUpdateSectionFromatingModal(true)} label="Update Display Text" />
              </>
            )}
          </div>
        </div>
        {(step?.ai_formatting || step?.displayText) && (
          <div className="mb-4 w-full">
            <DisplayText data-ai-display-text html={step?.ai_formatting || step?.displayText} />
          </div>
        )}
        {aiPromptModal && (
          <Modal title="Customize Prompt" onClose={() => setAiPromptModal(false)}>
            <ApplicantAiPromptModal
              aiCustomizablePrompt={step?.aiCustomizablePrompt}
              sectionId={step?._id}
              companyInformationStep={companyInformationStep}
              onClose={() => setAiPromptModal(false)}
            />
          </Modal>
        )}
        {showRequiredDocs && aiResponse && (
          <ApplicantRequiredDocsNotice
            isLoading={isAiLoading}
            aiResponse={aiResponse}
            onHide={() => setShowRequiredDocs(false)}
          />
        )}
        {!showRequiredDocs && (
          <div className="mb-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowRequiredDocs(true)} label="Show Required Documents" />
          </div>
        )}
        {updateSectionFromatingModal && (
          <Modal onClose={() => setUpdateSectionFromatingModal(false)}>
            <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
          </Modal>
        )}
      </div>
      <div className="mt-6 w-full">
        {fields?.map((field, index) =>
          field.type === FIELD_TYPES.FILE ? (
            <div className="flex w-full flex-col gap-4 p-6" key={index}>
              {field?.ai_formatting && field?.isDisplayText && (
                <div className="flex w-full flex-col gap-4 p-4 pb-0">
                  <DisplayText className="w-full" data-ai-display-text html={field?.ai_formatting} />
                </div>
              )}
              <FileUploader
                label={field?.label}
                file={file}
                onFileSelect={setFile}
                existingUrl={form?.[field?.uniqueId]?.value?.secureUrl || form?.[field?.uniqueId]?.secureUrl || ""}
              />
            </div>
          ) : (
            <div key={index} className="mt-4">
              <OtherInputType field={field} placeholder={field.placeholder} form={form} setForm={setForm} className="" />
            </div>
          ),
        )}
      </div>
      <div className="mt-4">
        {isSignature && (
          <SignatureBox step={step} onSave={handleSignatureUpload} oldSignatureUrl={getSignatureUrl(form?.signature)} />
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
              label={isAllRequiredFilled ? "Next" : "Some fields are missing"}
              data-testid="form-next-btn"
              onClick={handleNextStep}
            />
          ) : (
            <Button
              disabled={formLoading || isActionDisabled}
              className={`${(formLoading || isActionDisabled) && "pinter-events-none cursor-not-allowed opacity-20"}`}
              label={isAllRequiredFilled ? "Submit" : "Some fields are missing"}
              data-testid="form-submit-btn"
              onClick={handleSubmitStep}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={_id}
            fields={fields}
            isArticleForm={true}
            formRefetch={formRefetch}
            section={step}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Documents;
