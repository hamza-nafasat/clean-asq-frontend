import { useState } from "react";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import { useFormateTextInMarkDownMutation } from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import HtmlContent from "@/components/shared/HtmlContent";

const ApplicantDisplayTextEditor = ({
  initialText = "",
  initialInstructions = "",
  initialFormatted = "",
  isSaving = false,
  previewClassName = "w-full",
  isPreviewAiText = false,
  cancelLabel = "Cancel",
  onSave,
  onCancel,
}) => {
  const [values, setValues] = useState({
    text: initialText,
    instructions: initialInstructions,
    formatted: initialFormatted,
  });
  const [formateTextInMarkDown, { isLoading: isFormatting }] = useFormateTextInMarkDownMutation();

  const handleFormatText = async () => {
    if (!values.text || !values.instructions) {
      toast.error("Please enter formatting instruction and text to format");
      return;
    }
    try {
      const res = await formateTextInMarkDown({ text: values.text, instructions: values.instructions }).unwrap();
      if (res.success) {
        const html = DOMPurify.sanitize(res.data);
        setValues((prev) => ({ ...prev, formatted: html }));
      }
    } catch (error) {
      console.error("Format text error:", error);
      toast.error(error?.data?.message || "Failed to format text");
    }
  };

  return (
    <div className="flex flex-col gap-2 border-2 p-2 pb-4">
      <div className="flex w-full flex-col gap-2 pb-4">
        <TextField
          type="textarea"
          label="Display Text"
          value={values.text}
          name="displayText"
          onChange={(e) => setValues((prev) => ({ ...prev, text: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={values.instructions}
          onChange={(e) => setValues((prev) => ({ ...prev, instructions: e.target.value }))}
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleFormatText} disabled={isFormatting} className="mt-8" label="Format Text" />
        </div>
        {values.formatted && (
          <HtmlContent
            className={previewClassName}
            data-ai-display-text={isPreviewAiText || undefined}
            html={values.formatted}
          />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button onClick={onCancel} disabled={isSaving} variant="secondary" label={cancelLabel} />
        <Button onClick={() => onSave?.(values)} disabled={isSaving} label="Save" />
      </div>
    </div>
  );
};

export default ApplicantDisplayTextEditor;
