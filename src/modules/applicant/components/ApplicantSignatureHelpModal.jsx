import { useState } from "react";
import { toast } from "react-toastify";
import { useFormateTextInMarkDownMutation, useUpdateFormSectionMutation } from "@/redux/apis/form.apis";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import HtmlContent from "@/components/shared/HtmlContent";

const ApplicantSignatureHelpModal = ({ section = {}, formRefetch, onClose }) => {
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();
  const [formateTextInMarkDown, { isLoading: isFormatting }] = useFormateTextInMarkDownMutation();
  const [helpData, setHelpData] = useState({
    isSignAiHelp: true,
    signAiPrompt: section?.signAiPrompt || "",
    signAiResponse: section?.signAiResponse || "",
  });

  const handleSave = async () => {
    try {
      const res = await updateSection({ _id: section?._id, data: helpData }).unwrap();
      if (res.success) {
        await formRefetch?.();
        toast.success(res.message);
        onClose?.();
      }
    } catch (error) {
      console.error("Update signature help error:", error);
    }
  };

  const handleGetResponse = async () => {
    if (!helpData.signAiPrompt) {
      toast.error("Please enter a prompt first");
      return;
    }
    try {
      const res = await formateTextInMarkDown({ text: helpData.signAiPrompt }).unwrap();
      if (res.success) {
        const html = sanitizeHtml(res.data);
        setHelpData((prev) => ({ ...prev, signAiResponse: html }));
      }
    } catch (error) {
      console.error("Get AI response error:", error);
      toast.error(error?.data?.message || "Failed to format text");
    }
  };

  return (
    <div className="flex flex-col gap-2 border-2 p-2 pb-4">
      <div className="flex w-full flex-col gap-2 pb-4">
        <TextField
          label="Ai Prompt"
          type="textarea"
          value={helpData.signAiPrompt}
          name="aiPrompt"
          onChange={(e) => setHelpData((prev) => ({ ...prev, signAiPrompt: e.target.value }))}
        />
        <div className="flex justify-end">
          <Button onClick={handleGetResponse} disabled={isFormatting} className="mt-8" label="Get Response" />
        </div>
        {helpData.signAiResponse && (
          <HtmlContent className="w-full" html={helpData.signAiResponse} />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button onClick={onClose} variant="secondary" disabled={isUpdatingSection} label="Cancel" />
        <Button onClick={handleSave} disabled={isUpdatingSection} label="Save" />
      </div>
    </div>
  );
};

export default ApplicantSignatureHelpModal;
