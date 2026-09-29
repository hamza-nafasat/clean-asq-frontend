import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateFormMutation, useUpdateFormMutation } from "@/redux/apis/form.apis";
import useAiChat from "@/hooks/useAiChat";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";
import FileUploader from "@/components/global/FileUploader";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import { ASSISTANT_ROLE, FORM_UPLOAD_ACCEPT, FORM_UPLOAD_FIELDS } from "../utils/applicationForms.constants";
import { getDuplicateFormName, isDuplicateFormError } from "../utils/applicationForms.duplicate.utils";

const ApplicationFormsCreateModal = ({ isOpen = false, onClose }) => {
  const { addMessage, setIsOpen } = useAiChat();
  const [createForm, { isLoading }] = useCreateFormMutation();
  const [updateForm] = useUpdateFormMutation();
  const [file, setFile] = useState(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [pendingFormName, setPendingFormName] = useState("");
  const canUpdateForm = usePermission(PERMISSIONS.UPDATE_FORM);

  const handleClose = () => {
    setFile(null);
    setIsRenameOpen(false);
    setPendingFormName("");
    onClose?.();
  };

  // follow-up steps; the form already exists
  const finalizeFormCreation = async (form) => {
    if (!form?._id || !form?.name) return;
    try {
      if (canUpdateForm) await updateForm({ _id: form._id, data: { headerText: form.name } }).unwrap();
    } catch (error) {
      console.error("Finish form setup error:", error);
      toast.warning("The form was created, but its header could not be set. Update it from the form menu.");
      return;
    }
    setIsOpen(true);
    addMessage({
      role: ASSISTANT_ROLE,
      content: `Form **"${form.name}"** was created successfully. You can now configure its sections, fields, AI prompts, and email templates — just let me know what you'd like to do next.`,
    });
  };

  const handleCreateForm = async () => {
    if (!file) return toast.error("Please select a file");
    try {
      const formData = new FormData();
      formData.append(FORM_UPLOAD_FIELDS.FILE, file);
      const res = await createForm(formData).unwrap();
      if (res.success) {
        toast.success(res.message);
        await finalizeFormCreation(res.data);
        handleClose();
      }
    } catch (error) {
      console.error("Create form error:", error);
      if (isDuplicateFormError(error)) {
        setPendingFormName(getDuplicateFormName(error));
        setIsRenameOpen(true);
      } else {
        toast.error(error?.data?.message || "Failed to create form");
        handleClose();
      }
    }
  };

  const handleCreateWithName = async () => {
    if (!pendingFormName.trim()) return toast.error("Please enter a form name");
    try {
      const formData = new FormData();
      formData.append(FORM_UPLOAD_FIELDS.FILE, file);
      formData.append(FORM_UPLOAD_FIELDS.NAME, pendingFormName.trim());
      const res = await createForm(formData).unwrap();
      if (res.success) {
        toast.success(res.message);
        await finalizeFormCreation(res.data);
        handleClose();
      }
    } catch (error) {
      console.error("Create form error:", error);
      toast.error(error?.data?.message || "Failed to create form");
      setPendingFormName("");
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (pendingFormName.trim() && !isLoading) handleCreateWithName();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal onClose={handleClose} title="Create Form">
        <FileUploader label="Upload Image / PDF / CSV" accept={FORM_UPLOAD_ACCEPT} onFileSelect={setFile} />
        <div className="my-2 flex items-center justify-end">
          <Button label="Create" onClick={handleCreateForm} disabled={!file || isLoading} loading={isLoading} />
        </div>
      </Modal>
      {isRenameOpen && (
        <Modal onClose={handleClose} title="Form Name Already Exists">
          <form className="flex flex-col gap-4 p-4" onSubmit={handleRenameSubmit}>
            <p className="text-sm text-gray-600">
              A form with this name already exists. Please enter a different name to continue.
            </p>
            <TextField
              label="Form Name"
              placeholder="Enter a unique form name"
              value={pendingFormName}
              onChange={(e) => setPendingFormName(e.target.value)}
              name="form-name-override"
              autoFocus
              onFocus={(e) => {
                const len = e.target.value.length;
                e.target.setSelectionRange(len, len);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" label="Cancel" onClick={handleClose} />
              <Button
                type="submit"
                label="Create"
                loading={isLoading}
                disabled={!pendingFormName.trim() || isLoading}
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default ApplicationFormsCreateModal;
