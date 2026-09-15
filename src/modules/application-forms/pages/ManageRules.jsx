import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { GripVertical, PencilIcon, ToggleRight, Trash } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useDeleteSingleFormRuleMutation,
  useGetAllFormRulesQuery,
  useUpdateRulesOrderMutation,
  useUpdateStatusSingleFormRuleMutation,
} from "@/redux/apis/form.apis";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import CustomLoading from "@/components/shared/CustomLoading";
import Modal from "@/components/shared/Modal";
import { CreateRuleModal, UpdateRuleModal } from "../components/ApplicationFormsRuleEditor";
import ApplicationFormsRulesFilter from "../components/ApplicationFormsRulesFilter";
import ApplicationFormsRulesTable from "../components/ApplicationFormsRulesTable";
import { buildRuleColumns } from "../utils/application-forms.columns";
import {
  INITIAL_RULE_FILTERS,
  RULE_DRAG_ACTIVATION_DISTANCE,
  RULE_STATUSES,
} from "../utils/application-forms.constants";

const matchesRuleFilters = (rule, filters) => {
  const matchName = !filters.name || rule.name?.toLowerCase().includes(filters.name.toLowerCase());
  const matchCategory = !filters.category || rule.category === filters.category;
  const matchStatus =
    !filters.status ||
    (filters.status === RULE_STATUSES.ACTIVE && rule.isActive) ||
    (filters.status === RULE_STATUSES.INACTIVE && !rule.isActive);
  return matchName && matchCategory && matchStatus;
};

const ManageRules = () => {
  const { formId } = useParams();
  const [actionMenu, setActionMenu] = useState(null);
  const [openCreateRuleModal, setOpenCreateRuleModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteRuleConfirmation, setDeleteRuleConfirmation] = useState(null);
  const [updateStatusRuleConfirmation, setUpdateStatusRuleConfirmation] = useState(null);
  const [updateRuleConfirmation, setUpdateRuleConfirmation] = useState(null);
  const [filters, setFilters] = useState(INITIAL_RULE_FILTERS);
  const [orderedRules, setOrderedRules] = useState([]);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);

  const { data: rules, isLoading, refetch } = useGetAllFormRulesQuery({ formId });
  const [deleteRule, { isLoading: isDeletingRule }] = useDeleteSingleFormRuleMutation();
  const [updateStatusRule, { isLoading: isUpdatingStatusRule }] = useUpdateStatusSingleFormRuleMutation();
  const [updateRulesOrder, { isLoading: isUpdatingRulesOrder }] = useUpdateRulesOrderMutation();

  // reset local order when server data changes
  useEffect(() => {
    if (rules?.data) {
      setOrderedRules(rules.data);
      setIsOrderChanged(false);
    }
  }, [rules]);

  const filteredRules = useMemo(
    () => orderedRules.filter((rule) => matchesRuleFilters(rule, filters)),
    [orderedRules, filters],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: RULE_DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event) => setActiveDragId(event.active.id), []);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveDragId(null);
      if (!over || active.id === over.id) return;

      const oldFilteredIdx = filteredRules.findIndex((r) => r._id === active.id);
      const newFilteredIdx = filteredRules.findIndex((r) => r._id === over.id);
      const oldFullIdx = orderedRules.findIndex((r) => r._id === filteredRules[oldFilteredIdx]._id);
      const newFullIdx = orderedRules.findIndex((r) => r._id === filteredRules[newFilteredIdx]._id);

      const reordered = arrayMove(orderedRules, oldFullIdx, newFullIdx).map((r, i) => ({ ...r, order: i + 1 }));

      setOrderedRules(reordered);
      setIsOrderChanged(true);
    },
    [filteredRules, orderedRules],
  );

  const handleDragCancel = useCallback(() => setActiveDragId(null), []);

  const handleSaveOrder = async () => {
    try {
      const preparedData = orderedRules.map((rule, index) => ({
        ruleId: rule._id,
        order: index + 1,
      }));
      const res = await updateRulesOrder(preparedData).unwrap();
      if (res?.success) {
        toast.success(res.message || "Rules order updated successfully");
        setIsOrderChanged(false);
      }
    } catch (err) {
      console.error("Update rules order error:", err);
      toast.error(err?.data?.message || "Failed to update rules order");
      setIsOrderChanged(false);
    }
  };

  const handleResetOrder = () => {
    if (rules?.data) setOrderedRules(rules.data);
    setIsOrderChanged(false);
    toast.success("Rules order reset successfully");
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      const res = await deleteRule({ ruleId }).unwrap();
      if (res?.success) {
        toast.success(res.message || "Rule deleted successfully");
        await refetch();
        setDeleteRuleConfirmation(null);
      }
    } catch (err) {
      console.error("Delete rule error:", err);
      toast.error(err?.data?.message || "Failed to delete rule");
    }
  };

  const handleUpdateStatusRule = async (ruleId, isActive) => {
    try {
      const res = await updateStatusRule({
        ruleId,
        isActive: !isActive,
      }).unwrap();
      if (res?.success) {
        toast.success(res.message || "Rule status updated");
        await refetch();
        setUpdateStatusRuleConfirmation(null);
      }
    } catch (err) {
      console.error("Update rule status error:", err);
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const menuButtons = useMemo(() => {
    const openFor = (setOpen) => (row) => {
      setSelectedRow(row);
      setActionMenu(null);
      setOpen(true);
    };
    return [
      {
        name: "Update Status",
        icon: <ToggleRight size={16} className="mr-2" />,
        onClick: openFor(setUpdateStatusRuleConfirmation),
      },
      {
        name: "Update Rule",
        icon: <PencilIcon size={16} className="mr-2" />,
        onClick: openFor(setUpdateRuleConfirmation),
      },
      {
        name: "Delete",
        icon: <Trash size={16} className="mr-2" />,
        onClick: openFor(setDeleteRuleConfirmation),
      },
    ];
  }, []);

  const columns = useMemo(
    () =>
      buildRuleColumns({
        actionMenu,
        onToggleMenu: (ruleId) => setActionMenu((prev) => (prev === ruleId ? null : ruleId)),
        menuButtons,
      }),
    [actionMenu, menuButtons],
  );

  if (isLoading) return <CustomLoading />;

  return (
    <>
      {openCreateRuleModal && (
        <Modal onClose={() => setOpenCreateRuleModal(false)}>
          <CreateRuleModal formId={formId} setModal={setOpenCreateRuleModal} refetch={refetch} />
        </Modal>
      )}
      {updateRuleConfirmation && (
        <Modal onClose={() => setUpdateRuleConfirmation(false)}>
          <UpdateRuleModal ruleData={selectedRow} setModal={setUpdateRuleConfirmation} refetch={refetch} />
        </Modal>
      )}
      <ConfirmationModal
        isOpen={!!deleteRuleConfirmation}
        onClose={() => setDeleteRuleConfirmation(null)}
        onConfirm={() => handleDeleteRule(selectedRow?._id)}
        title="Delete Rule"
        message="Are you sure you want to delete this rule?"
        isLoading={isDeletingRule}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
      <ConfirmationModal
        isOpen={!!updateStatusRuleConfirmation}
        onClose={() => setUpdateStatusRuleConfirmation(null)}
        onConfirm={() => handleUpdateStatusRule(selectedRow?._id, selectedRow?.isActive)}
        isLoading={isUpdatingStatusRule}
        title="Update Status Rule"
        message="Are you sure you want to update the status of this rule?"
        confirmButtonText="Update"
        confirmButtonClassName="bg-red-500 text-white"
      />

      <article className="p-4">
        <div className="flex w-full flex-col gap-6">
          <ApplicationFormsRulesFilter
            filters={filters}
            setFilters={setFilters}
            isOrderChanged={isOrderChanged}
            isSavingOrder={isUpdatingRulesOrder}
            onSaveOrder={handleSaveOrder}
            onResetOrder={handleResetOrder}
            onCreateRule={() => setOpenCreateRuleModal(true)}
          />

          {/* Rules table */}
          <section className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="text-sm text-gray-500 px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-100">
              <span className="inline-flex items-center gap-1">
                <GripVertical size={14} />
                Drag the handle (⠿) to reorder rules
              </span>
              {activeDragId && <span className="text-xs text-blue-600 animate-pulse">Dragging rule…</span>}
            </div>
            <ApplicationFormsRulesTable
              columns={columns}
              data={filteredRules}
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              activeDragId={activeDragId}
            />
          </section>
        </div>
      </article>
    </>
  );
};

export default ManageRules;
