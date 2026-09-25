import { useState } from "react";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import FormField from "@/components/global/FormField";
import { FIELD_TYPES, MODAL_MODES } from "@/constants";
import { STRATEGY_FORM_FIELDS, STRATEGY_FORM_FIELD_PROPS, STRATEGY_FORM_LABELS } from "../utils/strategies.constants";
import { getInitialStrategyForm, validateStrategyForm } from "../utils/strategies.utils";

const MODAL_WIDTH = "w-[90%] max-w-3xl";

const StrategiesForm = ({ mode, initialData, onSubmit, isLoading, forms, formKeys }) => {
  const isEdit = mode === MODAL_MODES.EDIT;
  const [form, setForm] = useState(() => getInitialStrategyForm(initialData));
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateStrategyForm(form);
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
          {...STRATEGY_FORM_FIELD_PROPS}
          field={STRATEGY_FORM_FIELDS.NAME}
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <FormField
          {...STRATEGY_FORM_FIELD_PROPS}
          field={STRATEGY_FORM_FIELDS.FORM}
          label={STRATEGY_FORM_LABELS[STRATEGY_FORM_FIELDS.FORM]}
          value={form.form}
          onChange={handleChange}
          type={FIELD_TYPES.MULTI_SELECT}
          options={forms}
        />
        <FormField
          {...STRATEGY_FORM_FIELD_PROPS}
          field={STRATEGY_FORM_FIELDS.SEARCH_STRATEGIES}
          label={STRATEGY_FORM_LABELS[STRATEGY_FORM_FIELDS.SEARCH_STRATEGIES]}
          value={form.searchStrategies}
          onChange={handleChange}
          type={FIELD_TYPES.MULTI_SELECT}
          options={formKeys}
          error={errors.searchStrategies}
        />
        <div className="flex w-full justify-end">
          <Button type="submit" label={isEdit ? "Update" : "Create"} loading={isLoading} />
        </div>
      </form>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Strategy"
        message={`Save changes to "${initialData?.name}"?`}
        confirmButtonText="Update"
      />
    </>
  );
};

const StrategiesFormModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  initialData = null,
  mode = MODAL_MODES.ADD,
  isLoading = false,
  forms = [],
  formKeys = [],
}) => {
  if (!isOpen) return null;

  return (
    <Modal title={mode === MODAL_MODES.EDIT ? "Edit Strategy" : "Add Strategy"} onClose={onClose} width={MODAL_WIDTH}>
      <StrategiesForm
        key={initialData?._id}
        mode={mode}
        initialData={initialData}
        onSubmit={onSubmit}
        isLoading={isLoading}
        forms={forms}
        formKeys={formKeys}
      />
    </Modal>
  );
};

export default StrategiesFormModal;
