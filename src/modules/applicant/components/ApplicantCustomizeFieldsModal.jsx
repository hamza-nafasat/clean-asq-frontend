import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  useFormateTextInMarkDownMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useUpdateFormSectionMutation,
} from "@/redux/apis/form.apis";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import Button from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import HtmlContent from "@/components/shared/HtmlContent";
import TextField from "@/components/shared/TextField";
import ApplicantFieldCustomizer from "./ApplicantFieldCustomizer";
import { FIELD_TYPES } from "@/constants";
import { CUSTOMIZE_VARIANTS } from "../utils/applicant.constants";

const ApplicantCustomizeFieldsModal = ({
  onClose,
  fields = [],
  sectionId,
  formRefetch,
  suggestions,
  isArticleForm = false,
  section,
  variant = CUSTOMIZE_VARIANTS.FIELD,
}) => {
  const isOwnerVariant = variant === CUSTOMIZE_VARIANTS.OWNER;
  const [fieldsData, setFieldsData] = useState([]);
  const [originalFieldData, setOriginalFieldData] = useState([]);
  const [customizeForm, { isLoading }] = useUpdateDeleteCreateFormFieldsMutation();
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();
  const [isIdMissionQrEnabled, setIsIdMissionQrEnabled] = useState(section?.isIdMissionQr || false);
  const [signatureData, setSignatureData] = useState({
    isSignature: section?.isSignature || false,
    isSignDisplayText: section?.isSignDisplayText || false,
    isSignAiHelp: section?.isSignAiHelp || false,
    signDisplayFormattedText: section?.signDisplayFormattedText || "",
    signDisplayText: section?.signDisplayText || "",
    signAiPrompt: section?.signAiPrompt || "",
    signAiResponse: section?.signAiResponse || "",
    formatingAiInstruction: section?.signDisplayTextFormattingInstructions || "",
  });
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [signatureEnabling, setSignatureEnabling] = useState(false);

  const saveSignatureSettings = () =>
    updateSection({
      _id: sectionId,
      data: {
        isSignature: signatureData.isSignature,
        isSignDisplayText: signatureData.isSignDisplayText,
        isSignAiHelp: signatureData.isSignAiHelp,
        signDisplayText: signatureData.signDisplayText,
        signDisplayFormattedText: signatureData.signDisplayFormattedText,
        signAiPrompt: signatureData.signAiPrompt,
        signAiResponse: signatureData.signAiResponse,
        signDisplayTextFormattingInstructions: signatureData.formatingAiInstruction,
        ...(isOwnerVariant ? {} : { isIdMissionQr: isIdMissionQrEnabled }),
      },
    }).unwrap();

  const handleUpdateSectionForSignature = async () => {
    setSignatureEnabling(true);
    try {
      const res = await saveSignatureSettings();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
      }
    } catch (error) {
      console.error("Update signature settings error:", error);
    } finally {
      setSignatureEnabling(false);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!signatureData?.signDisplayText || !signatureData?.formatingAiInstruction) {
      toast.error("Please enter formatting instruction and text to format");
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: signatureData.signDisplayText,
        instructions: signatureData?.formatingAiInstruction,
      }).unwrap();
      if (res.success) {
        const html = sanitizeHtml(res.data);
        setSignatureData((prev) => ({ ...prev, signDisplayFormattedText: html }));
      }
    } catch (err) {
      console.error("Format text error:", err);
      toast.error(err?.data?.message || "Failed to format text");
    }
  }, [formateTextInMarkDown, signatureData?.formatingAiInstruction, signatureData.signDisplayText]);

  const getResponseFromAi = useCallback(async () => {
    if (!signatureData?.signAiPrompt?.trim()) return toast.error("Please enter a prompt to generate a response");
    try {
      const res = await formateTextInMarkDown({
        text: signatureData?.signAiPrompt,
      }).unwrap();
      if (res.success) {
        const html = sanitizeHtml(res.data);
        setSignatureData((prev) => ({ ...prev, signAiResponse: html }));
      }
    } catch (err) {
      console.error("Format text error:", err);
      toast.error(err?.data?.message || "Failed to format text");
    }
  }, [formateTextInMarkDown, signatureData?.signAiPrompt]);

  const addNewFieldHandler = () => setFieldsData((prev) => [...prev, { label: "", name: "", type: FIELD_TYPES.TEXT }]);

  const saveFormHandler = async () => {
    try {
      const payload = isOwnerVariant ? { sectionId, ownerFieldsData: fieldsData } : { sectionId, fieldsData };
      const res = await customizeForm(payload).unwrap();
      // signature settings save with the form too
      await saveSignatureSettings();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        onClose();
      }
    } catch (error) {
      console.error("Update form fields error:", error);
    }
  };

  useEffect(() => {
    if (!fields.length) return;
    setFieldsData(fields);
    setOriginalFieldData(fields);
  }, [fields]);

  return (
    <>
      <p className="bg-primary py-2 text-center text-2xl font-medium text-white">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <ApplicantFieldCustomizer
              isArticleForm={isArticleForm}
              field={field}
              originalFieldData={originalFieldData}
              fieldsData={fieldsData}
              setFieldsData={setFieldsData}
              index={index}
              suggestions={suggestions}
              variant={variant}
            />
          </div>
        ))}
      {/* Signature */}
      <div className="flex flex-col gap-2 border-2 p-2 pb-4">
        <div className="flex gap-2 pb-4">
          <Checkbox
            id="signature"
            label="Enable Signature for this section"
            checked={signatureData?.isSignature}
            disabled={signatureEnabling}
            className={`${signatureEnabling ? "pointer-events-none opacity-30" : ""}`}
            onChange={(e) => setSignatureData((prev) => ({ ...prev, isSignature: e.target.checked }))}
          />
          <Checkbox
            id="displayText"
            label="include display text"
            checked={signatureData?.isSignDisplayText}
            disabled={signatureEnabling}
            className={`${signatureEnabling ? "pointer-events-none opacity-30" : ""}`}
            onChange={(e) => setSignatureData((prev) => ({ ...prev, isSignDisplayText: e.target.checked }))}
          />
          <Checkbox
            id="aiHelp"
            label="Enable AI Help"
            checked={signatureData?.isSignAiHelp}
            disabled={signatureEnabling}
            className={`${signatureEnabling ? "pointer-events-none opacity-30" : ""}`}
            onChange={(e) => setSignatureData((prev) => ({ ...prev, isSignAiHelp: e.target.checked }))}
          />
        </div>
        {/* Display text */}
        {signatureData?.isSignDisplayText && (
          <div className="flex w-full flex-col gap-2 pb-4">
            <TextField
              type="textarea"
              label="Display Text"
              value={signatureData?.signDisplayText}
              name="displayText"
              onChange={(e) => setSignatureData((prev) => ({ ...prev, signDisplayText: e.target.value }))}
            />

            <label htmlFor="formattingInstructionForAi">
              Enter formatting instruction for AI and click on generate
            </label>
            <textarea
              id="formattingInstructionForAi"
              rows={2}
              value={signatureData?.formatingAiInstruction}
              onChange={(e) => setSignatureData((prev) => ({ ...prev, formatingAiInstruction: e.target.value }))}
              className="w-full rounded-md border border-gray-300 p-2 outline-none"
            />
            <div className="flex justify-end">
              <Button variant="standard" onClick={formateTextWithAi} disabled={isFormating} className="mt-8">
                Format Text
              </Button>
            </div>
            {signatureData?.signDisplayFormattedText && (
              <HtmlContent className="h-full p-4" html={signatureData?.signDisplayFormattedText} />
            )}
          </div>
        )}
        {/* AI help */}
        {signatureData?.isSignAiHelp && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center gap-2">
              <TextField
                type="textarea"
                label="AI Prompt"
                value={signatureData?.signAiPrompt}
                name="aiPrompt"
                onChange={(e) => setSignatureData((prev) => ({ ...prev, signAiPrompt: e.target.value }))}
              />
              <Button variant="standard" onClick={getResponseFromAi} disabled={isFormating || !signatureData?.signAiPrompt?.trim()} className="bg-primary mt-8 text-white">
                Generate
              </Button>
            </div>
            {signatureData?.signAiResponse && (
              <div className="w-full flex-col py-4">
                <h6 className="text-textPrimary py-2 text-xl font-semibold">AI Response</h6>
                <HtmlContent className="h-full p-4" html={signatureData?.signAiResponse} />
              </div>
            )}
          </div>
        )}
        {/* ID Mission QR */}
        {!isOwnerVariant && (
        <div className="flex gap-2 pb-4">
          <Checkbox
            id="idMissionQr"
            label="Enable ID Mission QR for this section"
            checked={isIdMissionQrEnabled}
            disabled={isUpdatingSection}
            className={`${signatureEnabling ? "pointer-events-none opacity-30" : ""}`}
            onChange={(e) => setIsIdMissionQrEnabled(e.target.checked)}
          />
        </div>
        )}
        <div className="flex w-full">
          <Button variant="standard"
            onClick={handleUpdateSectionForSignature}
            disabled={isUpdatingSection}
            className="bg-primary mt-8 w-full text-white"
          >
            Update
          </Button>
        </div>
      </div>
      <div className={isOwnerVariant ? "mt-6 flex w-full justify-between gap-2" : "mt-6 flex w-full items-center justify-between gap-2"}>
        {!isOwnerVariant && !isArticleForm && (
          <Button variant="standard" className="bg-primary w-[45%] cursor-pointer text-white" onClick={addNewFieldHandler}>
            Add New Field
          </Button>
        )}
        <Button variant="standard"
          onClick={() => saveFormHandler()}
          disabled={isLoading || isUpdatingSection}
          className={
            isOwnerVariant ? `bg-primary w-full cursor-pointer text-white` : `bg-primary cursor-pointer text-white ${isArticleForm ? "w-full" : "w-[45%]"}`
          }
        >
          Save Form
        </Button>
      </div>
    </>
  );
};

export default ApplicantCustomizeFieldsModal;
