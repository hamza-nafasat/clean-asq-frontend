import { useState } from "react";
import { useCreateFormStrategyMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import StrategiesFormField from "./StrategiesFormField";
import { FIELD_TYPES } from "@/constants";
import { STRATEGY_FORM_FIELDS } from "@/modules/strategies/utils/strategies.constants";

const StrategiesAddModal = ({ setIsModalOpen, forms = [], formKeys = [] }) => {
  const [form, setForm] = useState({ name: "", form: [], searchStrategies: [] });
  const [createFormStrategy, { isLoading }] = useCreateFormStrategyMutation();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.searchStrategies.length) return toast.error("Please fill all the fields");
    try {
      const res = await createFormStrategy(form).unwrap();
      if (res.success) {
        toast.success(res.message);
        setIsModalOpen?.(false);
        setForm({ name: "", form: "", searchStrategies: [] });
      }
    } catch (error) {
      console.error("Create strategy error:", error);
      toast.error(error?.data?.message || "Failed to create form strategy");
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
          label="Save"
          disabled={isLoading}
          className={isLoading ? "cursor-not-allowed opacity-50" : ""}
        />
      </div>
    </form>
  );
};

export default StrategiesAddModal;
