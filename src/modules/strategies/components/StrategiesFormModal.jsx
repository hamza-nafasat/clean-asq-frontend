import { useState } from "react";
import { useCreateFormStrategyMutation, useUpdateFormStrategyMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import FormField from "@/components/global/FormField";
import { FIELD_TYPES, MODAL_MODES } from "@/constants";
import { STRATEGY_FORM_FIELDS, STRATEGY_FORM_FIELD_PROPS } from "@/modules/strategies/utils/strategies.constants";
import { getInitialEditForm } from "@/modules/strategies/utils/strategies.utils";

const StrategiesFormModal = ({ mode = MODAL_MODES.ADD, selectedRow = null, onClose, forms = [], formKeys = [] }) => {
  const isEdit = mode === MODAL_MODES.EDIT;
  const [form, setForm] = useState(() =>
    isEdit ? getInitialEditForm(selectedRow) : { name: "", form: [], searchStrategies: [] }
  );
  const [createFormStrategy, { isLoading: isCreating }] = useCreateFormStrategyMutation();
  const [updateFormStrategy, { isLoading: isUpdating }] = useUpdateFormStrategyMutation();
  const isLoading = isEdit ? isUpdating : isCreating;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.name || !form.searchStrategies.length) return toast.error("Please fill all the fields");
    try {
      const res = await createFormStrategy(form).unwrap();
      if (res.success) {
        toast.success(res.message);
        onClose?.(false);
        setForm({ name: "", form: "", searchStrategies: [] });
      }
    } catch (error) {
      console.error("Create strategy error:", error);
      toast.error(error?.data?.message || "Failed to create form strategy");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await updateFormStrategy({ FormStrategyId: selectedRow._id, data: form }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        onClose?.(false);
      }
    } catch (error) {
      console.error("Update strategy error:", error);
      toast.error(error?.data?.message || "Failed to update form strategy");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    return isEdit ? handleUpdate() : handleCreate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField {...STRATEGY_FORM_FIELD_PROPS} field={STRATEGY_FORM_FIELDS.NAME} value={form.name} onChange={handleChange} />
      <FormField
        {...STRATEGY_FORM_FIELD_PROPS}
        field={STRATEGY_FORM_FIELDS.FORM}
        value={form.form}
        onChange={handleChange}
        type={FIELD_TYPES.MULTI_SELECT}
        options={forms}
      />
      <FormField
        {...STRATEGY_FORM_FIELD_PROPS}
        field={STRATEGY_FORM_FIELDS.SEARCH_STRATEGIES}
        value={form.searchStrategies}
        onChange={handleChange}
        type={FIELD_TYPES.MULTI_SELECT}
        options={formKeys}
      />
      <div className="flex w-full justify-end">
        <Button
          type="submit"
          label="Save"
          disabled={isLoading}
          className={isLoading ? "cursor-not-allowed opacity-50" : ""}
        />
      </div>
    </form>
  );
};

export default StrategiesFormModal;
