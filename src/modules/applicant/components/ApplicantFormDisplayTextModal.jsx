import { toast } from "react-toastify";
import { useUpdateFormMutation } from "@/redux/apis/form.apis";
import ApplicantDisplayTextEditor from "./ApplicantDisplayTextEditor";

const ApplicantFormDisplayTextModal = ({
  form = {},
  fieldKeys = {},
  previewClassName = "w-full",
  cancelLabel = "Cancel",
  formRefetch,
  onClose,
}) => {
  const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();

  const handleSave = async ({ text, instructions, formatted }) => {
    try {
      const res = await updateForm({
        _id: form?._id,
        data: {
          [fieldKeys.text]: text,
          [fieldKeys.instructions]: instructions,
          [fieldKeys.formatted]: formatted,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch?.();
        toast.success(res.message);
        onClose?.();
      }
    } catch (error) {
      console.error("Update display text error:", error);
    }
  };

  return (
    <ApplicantDisplayTextEditor
      initialText={form?.[fieldKeys.text] || ""}
      initialInstructions={form?.[fieldKeys.instructions] || ""}
      initialFormatted={form?.[fieldKeys.formatted] || ""}
      isSaving={isUpdating}
      previewClassName={previewClassName}
      cancelLabel={cancelLabel}
      onSave={handleSave}
      onCancel={onClose}
    />
  );
};

export default ApplicantFormDisplayTextModal;
