import { useState } from "react";
import { useUpdateFormStrategyMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import StrategiesFormField from "./StrategiesFormField";
import { FIELD_TYPES } from "@/constants";
import { STRATEGY_FORM_FIELDS } from "@/modules/strategies/utils/strategies.constants";
import { getInitialEditForm } from "@/modules/strategies/utils/strategies.utils";

const StrategiesEditModal = ({ selectedRow = null, setEditModalData, forms = [], formKeys = [] }) => {
  const [form, setForm] = useState(() => getInitialEditForm(selectedRow));
  const [updateFormStrategy, { isLoading }] = useUpdateFormStrategyMutation();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateFormStrategy({ FormStrategyId: selectedRow._id, data: form }).unwrap();
      if (res?.success) {
        toast.success(res.message);
        setEditModalData?.(false);
      }
    } catch (error) {
      console.error("Update strategy error:", error);
      toast.error(error?.data?.message || "Failed to update form strategy");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StrategiesFormField field={STRATEGY_FORM_FIELDS.NAME} value={form.name} onChange={handleChange} />
      <StrategiesFormField
        field={STRATEGY_FORM_FIELDS.FORM}
        value={form.form}
        onChange={handleChange}
        type={FIELD_TYPES.MULTI_SELECT}
        options={forms}
      />
      <StrategiesFormField
        field={STRATEGY_FORM_FIELDS.SEARCH_STRATEGIES}
        value={form.searchStrategies}
        onChange={handleChange}
        type={FIELD_TYPES.MULTI_SELECT}
        options={formKeys}
      />
      <div className="flex w-full justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className={isLoading ? "cursor-not-allowed opacity-50" : ""}
          label="Save"
        />
      </div>
    </form>
  );
};

export default StrategiesEditModal;
