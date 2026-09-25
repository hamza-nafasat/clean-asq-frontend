import { useState } from "react";
import { toast } from "react-toastify";
import {
  useCreateFormRuleMutation,
  useGetFormRuleFromAiMutation,
  useUpdateSingleFormRuleMutation,
} from "@/redux/apis/form.apis";
import { MODAL_MODES } from "@/constants";
import { INITIAL_RULE } from "../utils/applicationForms.constants";
import { validateRule, validateRuleBasics } from "../utils/applicationForms.validation.utils";

// editing starts from saved rule
const getInitialRule = (initialData) =>
  Object.fromEntries(Object.keys(INITIAL_RULE).map((key) => [key, initialData?.[key] ?? INITIAL_RULE[key]]));

const useApplicationFormsRuleForm = ({ mode, formId, initialData, onClose }) => {
  const isEdit = mode === MODAL_MODES.EDIT;
  const [rule, setRule] = useState(() => getInitialRule(isEdit ? initialData : null));
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [createRule, { isLoading: isCreating }] = useCreateFormRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateSingleFormRuleMutation();
  const [getRuleFromAi, { isLoading: isGenerating }] = useGetFormRuleFromAiMutation();

  const handleChange = ({ target: { name, value } }) => {
    setRule((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const showErrors = (nextErrors) => {
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const handleGenerate = async () => {
    if (!showErrors(validateRuleBasics(rule))) return;
    try {
      const { prompt, name, category, order } = rule;
      const res = await getRuleFromAi({ formId, prompt, name, category, ...(isEdit && { order }) }).unwrap();
      const { name: aiName, handler, formula, example, explanation, order: aiOrder, category: aiCategory } =
        res?.data || {};
      setRule((prev) => ({
        ...prev,
        name: aiName ?? prev.name,
        category: aiCategory ?? prev.category,
        order: aiOrder ?? prev.order,
        handler,
        formula,
        example,
        explanation,
      }));
    } catch (error) {
      console.error("Get form rule from ai error:", error);
      toast.error(error?.data?.message || "Failed to get form rule from ai");
    }
  };

  const saveRule = async () => {
    const data = { formId, ...rule, isEmailSentOn: Boolean(rule.isEmailSentOn) };
    try {
      const res = isEdit
        ? await updateRule({ data, ruleId: initialData?._id }).unwrap()
        : await createRule(data).unwrap();
      toast.success(res?.message || `Rule ${isEdit ? "updated" : "created"} successfully`);
      setIsConfirmOpen(false);
      onClose?.();
    } catch (error) {
      console.error(`${isEdit ? "Update" : "Create"} rule error:`, error);
      toast.error(error?.data?.message || `Failed to ${isEdit ? "update" : "create"} rule`);
    }
  };

  const handleSubmit = () => {
    if (!showErrors(validateRule(rule))) return;
    if (isEdit) setIsConfirmOpen(true);
    else saveRule();
  };

  return {
    rule,
    errors,
    isEdit,
    isSaving: isCreating || isUpdating,
    isGenerating,
    isConfirmOpen,
    closeConfirm: () => setIsConfirmOpen(false),
    handleChange,
    handleGenerate,
    handleSubmit,
    handleConfirmUpdate: saveRule,
  };
};

export default useApplicationFormsRuleForm;
