import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAddBrandingInFormMutation } from "@/redux/apis/branding.apis";
import { useCreateFormMutation, useUpdateFormMutation } from "@/redux/apis/form.apis";
import useAiChat from "@/hooks/useAiChat";
import { mapHomeBranding } from "@/utils/executeBrandingAssignment";
import FileUploader from "@/components/global/FileUploader";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import { YES_NO_VALUES } from "@/constants";
import { ASSISTANT_ROLE, FORM_UPLOAD_ACCEPT, FORM_UPLOAD_FIELDS } from "../utils/applicationForms.constants";
import { getDuplicateFormName, isDuplicateFormError } from "../utils/applicationForms.utils2";

const DISABLED_CLASSES = "pointer-events-none cursor-not-allowed opacity-50";

const ApplicationFormsCreateModal = ({ onClose, refetch }) => {
  const user = useSelector((state) => state.auth.user);
  const { addMessage, setIsOpen } = useAiChat();
  const [createForm, { isLoading }] = useCreateFormMutation();
  const [updateForm] = useUpdateFormMutation();
  const [addFromBranding] = useAddBrandingInFormMutation();
  const [file, setFile] = useState(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [pendingFormName, setPendingFormName] = useState("");

  const homeBranding = mapHomeBranding(user);

  const finalizeFormCreation = async (res) => {
    if (!res.data?._id || !res.data?.name) return;
    await updateForm({
      _id: res.data._id,
      data: { headerText: res.data.name },
    }).unwrap();
    if (homeBranding?._id) {
      await addFromBranding({
        brandingId: homeBranding._id,
        formId: res.data._id,
        onHome: YES_NO_VALUES.NO,
      }).unwrap();
    }
    await refetch?.();
    setIsOpen(true);
    addMessage({
      role: ASSISTANT_ROLE,
      content: `Form **"${res.data.name}"** was created successfully${homeBranding?._id ? " and the default branding has been applied" : ""}. You can now configure its sections, fields, AI prompts, and email templates — just let me know what you'd like to do next.`,
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
        await finalizeFormCreation(res);
        onClose?.();
      }
    } catch (error) {
      console.error("Create form error:", error);
      if (isDuplicateFormError(error)) {
        setPendingFormName(getDuplicateFormName(error));
        setIsRenameOpen(true);
      } else {
        toast.error(error?.data?.message || "Failed to create form");
        onClose?.();
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
        await finalizeFormCreation(res);
        setIsRenameOpen(false);
        setPendingFormName("");
        onClose?.();
      }
    } catch (error) {
      console.error("Create form error:", error);
      toast.error(error?.data?.message || "Failed to create form");
      setPendingFormName("");
    }
  };

  const handleCloseRename = () => {
    setIsRenameOpen(false);
    setPendingFormName("");
    onClose?.();
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (pendingFormName.trim() && !isLoading) handleCreateWithName();
  };

  return (
    <>
      <Modal onClose={onClose} title="">
        <FileUploader label="Upload Image / PDF / CSV" accept={FORM_UPLOAD_ACCEPT} onFileSelect={setFile} />
        <div className="my-2 flex items-center justify-end">
          <Button
            className={`${(!file || isLoading) && DISABLED_CLASSES}`}
            label={"Create "}
            onClick={handleCreateForm}
          />
        </div>
      </Modal>
      {isRenameOpen && (
        <Modal onClose={handleCloseRename} title="Form Name Already Exists">
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
              <Button type="button" variant="secondary" label="Cancel" onClick={handleCloseRename} />
              <Button
                type="submit"
                label="Create"
                loading={isLoading}
                className={`${(!pendingFormName.trim() || isLoading) && DISABLED_CLASSES}`}
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default ApplicationFormsCreateModal;
