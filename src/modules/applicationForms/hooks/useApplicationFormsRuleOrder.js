import { useState } from "react";
import { toast } from "react-toastify";
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useUpdateRulesOrderMutation } from "@/redux/apis/form.apis";
import { RULE_DRAG_ACTIVATION_DISTANCE } from "../utils/applicationForms.constants";

// draft ids first, then new rules
const applyDraftOrder = (rules, draftIds) => {
  const ruleById = new Map(rules.map((rule) => [rule._id, rule]));
  const draftRules = draftIds.map((id) => ruleById.get(id)).filter(Boolean);
  const newRules = rules.filter((rule) => !draftIds.includes(rule._id));
  return [...draftRules, ...newRules].map((rule, index) => ({ ...rule, order: index + 1 }));
};

// local drag order until saved
const useApplicationFormsRuleOrder = ({ rules = [] }) => {
  const [draftIds, setDraftIds] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [updateRulesOrder, { isLoading: isSavingOrder }] = useUpdateRulesOrderMutation();

  const orderedRules = draftIds ? applyDraftOrder(rules, draftIds) : rules;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: RULE_DRAG_ACTIVATION_DISTANCE } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }) => {
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = orderedRules.findIndex((r) => r._id === active.id);
    const newIndex = orderedRules.findIndex((r) => r._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setDraftIds(arrayMove(orderedRules, oldIndex, newIndex).map((r) => r._id));
  };

  const handleSaveOrder = async () => {
    try {
      const rulesData = orderedRules.map((rule, index) => ({ ruleId: rule._id, order: index + 1 }));
      const res = await updateRulesOrder(rulesData).unwrap();
      toast.success(res?.message || "Rules order updated successfully");
      setDraftIds(null);
      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Update rules order error:", error);
      toast.error(error?.data?.message || "Failed to update rules order");
    }
  };

  const handleResetOrder = () => {
    setDraftIds(null);
    toast.success("Rules order reset successfully");
  };

  return {
    orderedRules,
    isOrderChanged: Boolean(draftIds),
    isSavingOrder,
    isConfirmOpen,
    openConfirm: () => setIsConfirmOpen(true),
    closeConfirm: () => setIsConfirmOpen(false),
    activeDragId,
    sensors,
    handleDragStart: (event) => setActiveDragId(event.active.id),
    handleDragEnd,
    handleDragCancel: () => setActiveDragId(null),
    handleSaveOrder,
    handleResetOrder,
  };
};

export default useApplicationFormsRuleOrder;
