import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useFormateTextInMarkDownMutation } from "@/redux/apis/form.apis";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import usePermission from "@/hooks/usePermission";
import { OtherInputType } from "@/components/global/DynamicField";
import FileUploader from "@/components/global/FileUploader";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import ApplicantAiPromptModal from "./ApplicantAiPromptModal";
import ApplicantCustomizeFieldsModal from "./ApplicantCustomizeFieldsModal";
import ApplicantDisplayText from "./ApplicantDisplayText";
import ApplicantRequiredDocsNotice from "./ApplicantRequiredDocsNotice";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantStepActions from "./ApplicantStepActions";
import { FIELD_TYPES } from "@/constants";
import { FIELD_NAME_PARTS, SECTION_KEYS } from "../utils/applicant.constants";
import { buildDocumentsAiPrompt, parseDocumentUrls } from "../utils/applicant.documents.utils";
import { buildSignatureUploadHandler } from "../utils/applicant.signature.utils";
import { areDocumentsComplete } from "../utils/applicant.validation.utils";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { PERMISSIONS } from "@/utils/permissions";
import { normalizeFieldEntry, normalizeSignature } from "@/utils/signatureShape";

const ApplicantDocuments = ({
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
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isAiPromptModalOpen, setIsAiPromptModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [form, setForm] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showRequiredDocs, setShowRequiredDocs] = useState(true);
  const [formateTextInMarkDown] = useFormateTextInMarkDownMutation();

  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const isOwner = Boolean(user?._id) && user?._id === step?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const requiredNames = fields
    .filter((f) => f.required)
    .map((f) => ({ name: f.name, uniqueId: f.uniqueId, type: f.type }));
  const fileField = fields.filter((field) => field.type === FIELD_TYPES.FILE).at(-1);
  const urlsFieldId = Object.keys(form).find((key) => key.includes(FIELD_NAME_PARTS.ARTICLE_URLS));
  const urls = parseDocumentUrls(form[urlsFieldId]?.value ?? form[urlsFieldId]);
  const aiPrompt = buildDocumentsAiPrompt(
    formData?.[SECTION_KEYS.COMPANY_INFORMATION] || {},
    step?.aiCustomizablePrompt || "",
  );
  // creators can always continue
  const isComplete =
    isOwner || areDocumentsComplete({ form, requiredNames, hasNewFile: !!file || urls.length > 0, isSignature });

  const handleSignatureUpload = buildSignatureUploadHandler({ form, setForm });

  // replace the stored file with the selected one; null when it failed
  const uploadSelectedFile = async (oldFileData) => {
    if (oldFileData?.publicId) {
      const isDeleted = await deleteImageFromCloudinary(oldFileData.publicId, oldFileData.resourceType);
      if (!isDeleted) {
        toast.error("File Not Deleted Please Try Again");
        return null;
      }
    }
    const result = await uploadImageOnCloudinary(file);
    if (result.publicId && result.secureUrl) return result;
    toast.error("File Not Uploaded Please Try Again");
    return null;
  };

  // upload the chosen file, then next or submit
  const handleContinue = async (onContinue) => {
    if (!isComplete) return toast.error("Please fill all required fields");
    if (!fileField) return toast.error("Please refresh the page once and try again");
    const oldFileData = form[fileField.uniqueId]?.value || form[fileField.uniqueId];
    const hasStoredFile = oldFileData?.publicId && oldFileData?.secureUrl;
    if (!file && !urls.length && !hasStoredFile && !isOwner) return toast.error("Please select a file or Enter a URL");
    setLoadingNext(true);
    try {
      const uploaded = file ? await uploadSelectedFile(oldFileData) : null;
      if (file && !uploaded) return setLoadingNext(false);
      const data = uploaded
        ? { ...form, [fileField.uniqueId]: { name: fileField.name, value: uploaded } }
        : { ...form };
      await onContinue({ data, name: sectionKey, setLoadingNext });
    } catch (error) {
      console.error("Upload document error:", error);
      toast.error("Something went wrong while uploading the document");
      setLoadingNext(false);
    }
  };

  // AI help on how to find the documents, once per prompt text
  useEffect(() => {
    if (!aiPrompt) return;
    const fetchRequiredDocuments = async () => {
      try {
        setIsAiLoading(true);
        const res = await formateTextInMarkDown({ text: aiPrompt }).unwrap();
        if (res?.success) setAiResponse(sanitizeHtml(res.data));
      } catch (error) {
        console.error("Fetch required documents error:", error);
        toast.error("Failed to load document requirements. Please try again later.");
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchRequiredDocuments();
  }, [aiPrompt, formateTextInMarkDown]);

  useEffect(() => {
    if (fields.length > 0) {
      const initialForm = {};
      fields.forEach((field) => {
        initialForm[field.uniqueId] = normalizeFieldEntry(reduxData?.[field.uniqueId], field.name);
      });
      setForm(initialForm);
    }
    if (isSignature) setForm((prev) => ({ ...prev, signature: normalizeSignature(reduxData?.signature) }));
  }, [fields, isSignature, reduxData]);

  submitFromEnterRef.current = () => {
    if (!isComplete || loadingNext) return;
    handleContinue(currentStep < totalSteps - 1 ? handleNext : handleSubmit);
  };
  useApplicantEnterToNextField(formContainerRef, { onLastFieldRef: submitFromEnterRef });

  return (
    <section ref={formContainerRef} className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <h2 className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
            {name}
          </h2>
          <div className="flex gap-2">
            <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label="Save my progress" />
            {canCustomize && (
              <>
                <Button variant="secondary" onClick={() => setIsCustomizeModalOpen(true)} label="Customize" />
                <Button onClick={() => setIsAiPromptModalOpen(true)} label="Customize Prompt" />
                <Button onClick={() => setIsSectionTextModalOpen(true)} label="Update Display Text" />
              </>
            )}
          </div>
        </header>
        {(step?.ai_formatting || step?.displayText) && (
          <ApplicantDisplayText
            className="mb-4 w-full"
            data-ai-display-text
            html={step?.ai_formatting || step?.displayText}
          />
        )}
        {isAiPromptModalOpen && (
          <Modal title="Customize Prompt" onClose={() => setIsAiPromptModalOpen(false)}>
            <ApplicantAiPromptModal
              aiCustomizablePrompt={step?.aiCustomizablePrompt}
              sectionId={step?._id}
              companyInformationStep={companyInformationStep}
              onClose={() => setIsAiPromptModalOpen(false)}
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
        {isSectionTextModalOpen && (
          <Modal onClose={() => setIsSectionTextModalOpen(false)}>
            <ApplicantSectionTextModal section={step} onClose={() => setIsSectionTextModalOpen(false)} />
          </Modal>
        )}
      </div>
      <div className="mt-6 w-full">
        {fields.map((field) =>
          field.type === FIELD_TYPES.FILE ? (
            <div className="flex w-full flex-col gap-4 p-6" key={field.uniqueId}>
              {field?.ai_formatting && field?.isDisplayText && (
                <ApplicantDisplayText className="w-full p-4 pb-0" data-ai-display-text html={field.ai_formatting} />
              )}
              <FileUploader
                label={field?.label}
                file={file}
                onFileSelect={setFile}
                existingUrl={form[field.uniqueId]?.value?.secureUrl || form[field.uniqueId]?.secureUrl || ""}
              />
            </div>
          ) : (
            <div key={field.uniqueId} className="mt-4">
              <OtherInputType
                field={field}
                placeholder={field.placeholder}
                form={form}
                setForm={setForm}
                className=""
              />
            </div>
          ),
        )}
      </div>
      {isSignature && (
        <div className="mt-4">
          <SignatureBox step={step} onSave={handleSignatureUpload} signature={form?.signature} />
        </div>
      )}

      <ApplicantStepActions
        currentStep={currentStep}
        totalSteps={totalSteps}
        isComplete={isComplete}
        isBusy={loadingNext || formLoading}
        incompleteLabel="Some fields are missing"
        onPrevious={handlePrevious}
        onNext={() => handleContinue(handleNext)}
        onSubmit={() => handleContinue(handleSubmit)}
      />
      {isCustomizeModalOpen && (
        <Modal onClose={() => setIsCustomizeModalOpen(false)}>
          <ApplicantCustomizeFieldsModal
            sectionId={_id}
            fields={fields}
            isArticleForm
            formRefetch={formRefetch}
            section={step}
            onClose={() => setIsCustomizeModalOpen(false)}
          />
        </Modal>
      )}
    </section>
  );
};

export default ApplicantDocuments;
