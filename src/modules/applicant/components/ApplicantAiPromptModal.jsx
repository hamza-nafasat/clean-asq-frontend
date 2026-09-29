import { useState } from "react";
import { toast } from "react-toastify";
import { useUpdateFormSectionMutation } from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";

const ApplicantAiPromptModal = ({ aiCustomizablePrompt = "", sectionId, companyInformationStep = {}, onClose }) => {
  const [prompt, setPrompt] = useState(aiCustomizablePrompt || "");
  const [updateFormSection, { isLoading: isUpdating }] = useUpdateFormSectionMutation();

  const handleSave = async () => {
    try {
      if (!prompt) return toast.error("Enter a prompt");
      const res = await updateFormSection({ _id: sectionId, data: { aiCustomizablePrompt: prompt } }).unwrap();
      if (res.success) {
        toast.success("Section Updated Successfully");
        onClose?.();
      }
    } catch (error) {
      console.error("Update AI prompt error:", error);
      toast.error(error?.data?.message || "Failed to update section");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Enter your custom prompt
        </label>
        <textarea
          id="prompt"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder="Write your AI prompt here..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Available variables:</span>
        <div className="flex flex-wrap gap-3">
          {companyInformationStep?.fields?.map((item, index) => (
            <Button
              key={index}
              label={item.name}
              type="button"
              onClick={() => setPrompt((prev) => prev + ` [${item.name}] `)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Click to insert variables into your prompt. These will be dynamically replaced by real values.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variant="secondary" label="Cancel" />
        <Button onClick={handleSave} label={isUpdating ? "Saving..." : "Save"} />
      </div>
    </div>
  );
};

export default ApplicantAiPromptModal;
