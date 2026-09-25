import { useState } from "react";
import { toast } from "react-toastify";
import { FiCopy } from "react-icons/fi";
import { useUpdateFormMutation } from "@/redux/apis/form.apis";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import { LAYOUT_ROUTES } from "@/constants";
import {
  COPY_RESET_MS,
  DEFAULT_HEADER_TEXT_SIZE,
  FORM_CONFIG_FIELDS,
  HEADER_TEXT_SIZE_LIMITS,
} from "../utils/applicationForms.constants";
import { validateFormConfig } from "../utils/applicationForms.validation.utils";

const getInitialValues = (form) => ({
  [FORM_CONFIG_FIELDS.REDIRECT_URL]: form?.redirectUrl || "",
  [FORM_CONFIG_FIELDS.HEADER_TEXT]: form?.headerText || "",
  [FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]: form?.headerTextSize || DEFAULT_HEADER_TEXT_SIZE,
});

const ApplicationFormsConfigurationModal = ({ isOpen = false, onClose, initialData = null }) => {
  const [values, setValues] = useState(() => getInitialValues(initialData));
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [updateForm, { isLoading: isUpdatingForm }] = useUpdateFormMutation();
  const { copy } = useCopyToClipboard(COPY_RESET_MS);

  if (!isOpen) return null;

  const formUrl = `${window.location.origin}${LAYOUT_ROUTES.APPLICATION_FORM}/${initialData?.branding?.name}/${initialData?._id}`;

  const handleChange = ({ target: { name, value } }) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = () => {
    const nextErrors = validateFormConfig(values);
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      const res = await updateForm({
        _id: initialData?._id,
        data: { ...values, [FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]: Number(values[FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]) },
      }).unwrap();
      toast.success(res?.message || "Form updated successfully");
      setIsConfirmOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Update form error:", error);
      toast.error(error?.data?.message || "Failed to update form");
    }
  };

  const handleCopyUrl = async () => {
    try {
      await copy(formUrl);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Copy form url error:", error);
      toast.error("Could not copy the link");
    }
  };

  return (
    <Modal onClose={onClose} title="Update Form">
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        isLoading={isUpdatingForm}
        title="Update Form"
        message="Save these settings for this form?"
        confirmButtonText="Save"
      />
      <section className="flex flex-col gap-6 p-4">
        {/* Form url */}
        <div className="flex items-center gap-2">
          <TextField
            label="Form URL"
            id={FORM_CONFIG_FIELDS.FORM_URL}
            name={FORM_CONFIG_FIELDS.FORM_URL}
            value={formUrl}
            readOnly
          />
          <Button
            label="Copy"
            variant="secondary"
            size="field"
            onClick={handleCopyUrl}
            className="self-end"
            rightIcon={FiCopy}
            cnRight="h-5 w-5"
          />
        </div>

        <TextField
          label="Redirect URL"
          id={FORM_CONFIG_FIELDS.REDIRECT_URL}
          name={FORM_CONFIG_FIELDS.REDIRECT_URL}
          placeholder="Enter redirect URL"
          value={values[FORM_CONFIG_FIELDS.REDIRECT_URL]}
          onChange={handleChange}
          error={errors[FORM_CONFIG_FIELDS.REDIRECT_URL]}
        />

        {/* Header text */}
        <div className="flex items-start gap-3">
          <TextField
            label="Header Text"
            id={FORM_CONFIG_FIELDS.HEADER_TEXT}
            name={FORM_CONFIG_FIELDS.HEADER_TEXT}
            placeholder="Enter header text"
            value={values[FORM_CONFIG_FIELDS.HEADER_TEXT]}
            onChange={handleChange}
            className="flex-1"
            style={{ fontSize: `${values[FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]}px` }}
          />
          <div className="w-32 shrink-0">
            <TextField
              type="number"
              label="Size (px)"
              id={FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE}
              name={FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE}
              min={HEADER_TEXT_SIZE_LIMITS.MIN}
              max={HEADER_TEXT_SIZE_LIMITS.MAX}
              value={values[FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]}
              onChange={handleChange}
              error={errors[FORM_CONFIG_FIELDS.HEADER_TEXT_SIZE]}
            />
          </div>
        </div>

        <footer className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button disabled={isUpdatingForm} label="Save" variant="primary" onClick={handleSave} />
        </footer>
      </section>
    </Modal>
  );
};

export default ApplicationFormsConfigurationModal;
