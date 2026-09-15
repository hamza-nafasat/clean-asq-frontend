import { toast } from "react-toastify";
import { useUpdateFormSectionMutation } from "@/redux/apis/form.apis";
import ApplicantDisplayTextEditor from "./ApplicantDisplayTextEditor";

const ApplicantSignatureCustomizeModal = ({ section = {}, formRefetch, onClose }) => {
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();

  const handleSave = async ({ text, instructions, formatted }) => {
    try {
      const res = await updateSection({
        _id: section?._id,
        data: {
          isSignature: section?.isSignature || false,
          isSignDisplayText: section?.isSignDisplayText || false,
          signDisplayText: text,
          signDisplayFormattedText: formatted,
          signDisplayTextFormattingInstructions: instructions,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch?.();
        toast.success(res.message);
        onClose?.();
      }
    } catch (error) {
      console.error("Update signature text error:", error);
    }
  };

  return (
    <ApplicantDisplayTextEditor
      initialText={section?.signDisplayText || ""}
      initialInstructions={section?.signDisplayTextFormattingInstructions || ""}
      initialFormatted={section?.signDisplayFormattedText || ""}
      isSaving={isUpdatingSection}
      isPreviewAiText
      onSave={handleSave}
      onCancel={onClose}
    />
  );
};

export default ApplicantSignatureCustomizeModal;
