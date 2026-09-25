import { useState } from "react";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import FormField from "@/components/global/FormField";
import { FIELD_TYPES, MODAL_MODES } from "@/constants";
import {
  ADD_COMPANY_IDENTIFICATION_OPTIONS,
  EDIT_COMPANY_IDENTIFICATION_OPTIONS,
  EXTRACT_AS_OPTIONS,
  LOOKUP_FORM_FIELDS,
  LOOKUP_FORM_FIELD_PROPS,
  LOOKUP_FORM_LABELS,
} from "../utils/lookupManagement.constants";
import { getInitialLookupForm, validateLookupForm } from "../utils/lookupManagement.form.utils";

const MODAL_WIDTH = "w-[90%] max-w-3xl";

const LookupManagementForm = ({ mode, initialData, onSubmit, isLoading }) => {
  const isEdit = mode === MODAL_MODES.EDIT;
  const [form, setForm] = useState(() => getInitialLookupForm(initialData));
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateLookupForm(form);
    if (Object.values(nextErrors).some(Boolean)) return setErrors(nextErrors);
    if (isEdit) return setIsConfirmOpen(true);
    onSubmit?.(form);
  };

  const handleConfirmUpdate = () => {
    setIsConfirmOpen(false);
    onSubmit?.(form);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          {...LOOKUP_FORM_FIELD_PROPS}
          field={LOOKUP_FORM_FIELDS.SEARCH_OBJECT_KEY}
          label={LOOKUP_FORM_LABELS[LOOKUP_FORM_FIELDS.SEARCH_OBJECT_KEY]}
          value={form.searchObjectKey}
          onChange={handleChange}
          error={errors.searchObjectKey}
        />
        <FormField
          {...LOOKUP_FORM_FIELD_PROPS}
          field={LOOKUP_FORM_FIELDS.COMPANY_IDENTIFICATION}
          value={form.companyIdentification}
          onChange={handleChange}
          type={FIELD_TYPES.MULTI_SELECT}
          options={isEdit ? EDIT_COMPANY_IDENTIFICATION_OPTIONS : ADD_COMPANY_IDENTIFICATION_OPTIONS}
          error={errors.companyIdentification}
        />
        <FormField
          {...LOOKUP_FORM_FIELD_PROPS}
          field={LOOKUP_FORM_FIELDS.EXTRACT_AS}
          value={form.extractAs}
          onChange={handleChange}
          type={FIELD_TYPES.SELECT}
          options={EXTRACT_AS_OPTIONS}
          error={errors.extractAs}
        />
        <FormField
          {...LOOKUP_FORM_FIELD_PROPS}
          field={LOOKUP_FORM_FIELDS.SEARCH_TERMS}
          value={form.searchTerms}
          onChange={handleChange}
          error={errors.searchTerms}
        />
        <FormField
          {...LOOKUP_FORM_FIELD_PROPS}
          field={LOOKUP_FORM_FIELDS.EXTRACTION_PROMPT}
          value={form.extractionPrompt}
          onChange={handleChange}
          type={FIELD_TYPES.TEXTAREA}
          error={errors.extractionPrompt}
        />
        <FormField
          {...LOOKUP_FORM_FIELD_PROPS}
          field={LOOKUP_FORM_FIELDS.ACTIVE}
          value={form.active}
          onChange={handleChange}
          type={FIELD_TYPES.CHECKBOX}
        />
        <div className="flex w-full justify-end">
          <Button type="submit" label={isEdit ? "Update" : "Create"} loading={isLoading} />
        </div>
      </form>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Lookup Key"
        message={`Save changes to "${initialData?.searchObjectKey}"?`}
        confirmButtonText="Update"
      />
    </>
  );
};

const LookupManagementAddEditModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  initialData = null,
  mode = MODAL_MODES.ADD,
  isLoading = false,
  draftKey = 0,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      title={mode === MODAL_MODES.EDIT ? "Edit Lookup Key" : "Add Lookup Key"}
      onClose={onClose}
      width={MODAL_WIDTH}
    >
      <LookupManagementForm
        key={initialData?._id ?? draftKey}
        mode={mode}
        initialData={initialData}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default LookupManagementAddEditModal;
