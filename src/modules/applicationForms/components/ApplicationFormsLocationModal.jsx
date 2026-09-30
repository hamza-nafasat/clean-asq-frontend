import { useState } from "react";
import { toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg";
import { useFormateTextInMarkDownMutation, useUpdateFormLocationMutation } from "@/redux/apis/form.apis";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import usePermission from "@/hooks/usePermission";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import { LOCATION_STATUSES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { LOCATION_FIELDS } from "../utils/applicationForms.constants";
import { validateLocation } from "../utils/applicationForms.validation.utils";

const LOCATION_OPTIONS = [
  { status: LOCATION_STATUSES.REQUIRED, label: "Location Required" },
  { status: LOCATION_STATUSES.OPTIONAL, label: "Optional Location" },
];

const getInitialValues = (form) => ({
  [LOCATION_FIELDS.STATUS]: form?.locationStatus || "",
  [LOCATION_FIELDS.MESSAGE]: form?.locationMessage || "",
  [LOCATION_FIELDS.FORMATTED_MESSAGE]: form?.formatedLocationMessage || "",
  [LOCATION_FIELDS.INSTRUCTIONS]: form?.formateTextInstructions || "",
});

const ApplicationFormsLocationModal = ({ isOpen = false, onClose, initialData = null }) => {
  const [values, setValues] = useState(() => getInitialValues(initialData));
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [updateFormLocation, { isLoading: isSaving }] = useUpdateFormLocationMutation();
  const [formatText, { isLoading: isFormatting }] = useFormateTextInMarkDownMutation();
  const canFormat = usePermission(PERMISSIONS.SUBMIT_FORM);

  if (!isOpen) return null;

  const handleChange = ({ target: { name, value } }) => {
    // changed text needs a new format
    const isSourceText = name === LOCATION_FIELDS.MESSAGE || name === LOCATION_FIELDS.INSTRUCTIONS;
    setValues((prev) => ({ ...prev, [name]: value, ...(isSourceText && canFormat && { [LOCATION_FIELDS.FORMATTED_MESSAGE]: "" }) }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggleStatus = (status) =>
    handleChange({
      target: {
        name: LOCATION_FIELDS.STATUS,
        value: values[LOCATION_FIELDS.STATUS] === status ? LOCATION_STATUSES.DISABLED : status,
      },
    });

  const handleFormatText = async () => {
    const fieldErrors = validateLocation(values);
    const formatErrors = {
      [LOCATION_FIELDS.MESSAGE]: fieldErrors[LOCATION_FIELDS.MESSAGE],
      [LOCATION_FIELDS.INSTRUCTIONS]: fieldErrors[LOCATION_FIELDS.INSTRUCTIONS],
    };
    if (formatErrors[LOCATION_FIELDS.MESSAGE] || formatErrors[LOCATION_FIELDS.INSTRUCTIONS]) {
      setErrors((prev) => ({ ...prev, ...formatErrors }));
      return;
    }
    try {
      const res = await formatText({
        text: values[LOCATION_FIELDS.MESSAGE],
        instructions: values[LOCATION_FIELDS.INSTRUCTIONS],
      }).unwrap();
      if (res?.success) handleChange({ target: { name: LOCATION_FIELDS.FORMATTED_MESSAGE, value: res.data } });
    } catch (error) {
      console.error("Format text error:", error);
      toast.error(error?.data?.message || "Failed to format text");
    }
  };

  const handleSave = () => {
    const nextErrors = validateLocation(values, { requireFormatted: canFormat });
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      const res = await updateFormLocation({ _id: initialData?._id, data: values }).unwrap();
      toast.success(res?.message || "Form location updated successfully");
      setIsConfirmOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Update form location error:", error);
      toast.error(error?.data?.message || "Failed to update form location");
    }
  };

  const formattedMessage = values[LOCATION_FIELDS.FORMATTED_MESSAGE];

  return (
    <Modal onClose={onClose} title="Set Location">
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        isLoading={isSaving}
        title="Update Location"
        message="Save these location settings for this form?"
        confirmButtonText="Save"
      />
      <section className="flex flex-col gap-6 p-4">
        <TextField
          type="textarea"
          label="Message"
          id={LOCATION_FIELDS.MESSAGE}
          name={LOCATION_FIELDS.MESSAGE}
          placeholder="Enter message"
          value={values[LOCATION_FIELDS.MESSAGE]}
          onChange={handleChange}
          error={errors[LOCATION_FIELDS.MESSAGE]}
        />
        <div className="flex flex-col gap-2">
          <TextField
            type="textarea"
            label="Formatting instructions"
            id={LOCATION_FIELDS.INSTRUCTIONS}
            name={LOCATION_FIELDS.INSTRUCTIONS}
            placeholder="Enter formatting instructions"
            value={values[LOCATION_FIELDS.INSTRUCTIONS]}
            onChange={handleChange}
            error={errors[LOCATION_FIELDS.INSTRUCTIONS]}
          />
          {canFormat && (
            <Button
              onClick={handleFormatText}
              disabled={isFormatting}
              icon={isFormatting ? CgSpinner : null}
              label="Format"
              variant="primary"
              className="w-fit self-end"
            />
          )}
        </div>

        {formattedMessage && (
          <section className="flex flex-col gap-2">
            <h3 className="font-medium text-gray-700">Formatted Message</h3>
            <div
              className="border border-gray-200 p-2"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(formattedMessage) }}
            />
          </section>
        )}
        {errors[LOCATION_FIELDS.FORMATTED_MESSAGE] && (
          <p className="text-sm text-red-600">{errors[LOCATION_FIELDS.FORMATTED_MESSAGE]}</p>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-4 font-semibold text-gray-800">Location Requirement</legend>
          {LOCATION_OPTIONS.map(({ status, label }) => (
            <label
              key={status}
              htmlFor={status}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
            >
              <span className="font-medium text-gray-700">{label}</span>
              <input
                name={status}
                id={status}
                type="checkbox"
                className="accent-primary h-5 w-5 cursor-pointer"
                checked={values[LOCATION_FIELDS.STATUS] === status}
                onChange={() => handleToggleStatus(status)}
              />
            </label>
          ))}
          {errors[LOCATION_FIELDS.STATUS] && <p className="text-sm text-red-600">{errors[LOCATION_FIELDS.STATUS]}</p>}
        </fieldset>

        <footer className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Save" variant="primary" onClick={handleSave} disabled={isSaving} />
        </footer>
      </section>
    </Modal>
  );
};

export default ApplicationFormsLocationModal;
