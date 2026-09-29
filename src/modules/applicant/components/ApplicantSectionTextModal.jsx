import { toast } from "react-toastify";
import { useUpdateFormSectionMutation } from "@/redux/apis/form.apis";
import ApplicantDisplayTextEditor from "./ApplicantDisplayTextEditor";

const ApplicantSectionTextModal = ({ section = {}, onClose }) => {
  const [updateFormSection, { isLoading: isUpdating }] = useUpdateFormSectionMutation();

  const handleSave = async ({ text, instructions, formatted }) => {
    if (!text || !formatted) return toast.error("Please enter display text and AI formatting");
    try {
      const res = await updateFormSection({
        _id: section._id,
        data: { displayText: text, aiFormatting: formatted, displayTextFormattingInstructions: instructions },
      }).unwrap();
      if (res.success) {
        toast.success("Section Updated Successfully");
        onClose?.();
      }
    } catch (error) {
      console.error("Update section text error:", error);
      toast.error(error?.data?.message || "Failed to update section");
    }
  };

  return (
    <ApplicantDisplayTextEditor
      initialText={section.displayText || ""}
      initialInstructions={section.displayTextFormattingInstructions || ""}
      initialFormatted={section.ai_formatting || ""}
      isSaving={isUpdating}
      previewClassName="h-full p-4"
      onSave={handleSave}
      onCancel={onClose}
    />
  );
};

export default ApplicantSectionTextModal;
