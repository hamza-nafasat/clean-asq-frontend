import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiAlertCircle, FiEdit2, FiToggleRight, FiTrash2 } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import {
  useDeleteSingleFormRuleMutation,
  useGetAllFormRulesQuery,
  useUpdateStatusSingleFormRuleMutation,
} from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import ApplicationFormsRuleModal from "./components/ApplicationFormsRuleModal";
import ApplicationFormsRulesFilter from "./components/ApplicationFormsRulesFilter";
import ApplicationFormsRulesHeading from "./components/ApplicationFormsRulesHeading";
import ApplicationFormsRulesTable from "./components/ApplicationFormsRulesTable";
import useApplicationFormsRuleAssistant from "./hooks/useApplicationFormsRuleAssistant";
import useApplicationFormsRuleOrder from "./hooks/useApplicationFormsRuleOrder";
import { MODAL_MODES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { INITIAL_RULE_FILTERS, RULE_ROW_ACTIONS } from "./utils/applicationForms.constants";
import { hasActiveRuleFilters, matchesRuleFilters } from "./utils/applicationForms.filter.utils";
import { buildRuleColumns } from "./utils/applicationForms.ruleColumns";

// row menu for the rules table
const buildMenuButtons = ({ canUpdateRule, canDeleteRule, onSelect }) =>
  [
    canUpdateRule && {
      name: "Update Status",
      icon: <FiToggleRight size={16} className="mr-2" />,
      onClick: (row) => onSelect(row, RULE_ROW_ACTIONS.STATUS),
    },
    canUpdateRule && {
      name: "Update Rule",
      icon: <FiEdit2 size={16} className="mr-2" />,
      onClick: (row) => onSelect(row, RULE_ROW_ACTIONS.EDIT),
    },
    canDeleteRule && {
      name: "Delete",
      icon: <FiTrash2 size={16} className="mr-2" />,
      onClick: (row) => onSelect(row, RULE_ROW_ACTIONS.DELETE),
    },
  ].filter(Boolean);

const ManageRules = () => {
  const { formId } = useParams();
  const [filters, setFilters] = useState(INITIAL_RULE_FILTERS);
  const [actionMenu, setActionMenu] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createCount, setCreateCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const canCreateRule = usePermission(PERMISSIONS.CREATE_RULE);
  const canUpdateRule = usePermission(PERMISSIONS.UPDATE_RULE);
  const canDeleteRule = usePermission(PERMISSIONS.DELETE_RULE);

  const { data: rules, isLoading, isError, refetch } = useGetAllFormRulesQuery({ formId });
  const [deleteRule, { isLoading: isDeletingRule }] = useDeleteSingleFormRuleMutation();
  const [updateStatusRule, { isLoading: isUpdatingStatusRule }] = useUpdateStatusSingleFormRuleMutation();

  const order = useApplicationFormsRuleOrder({ rules: rules?.data });
  const aiConfirm = useApplicationFormsRuleAssistant({ formId, rules: rules?.data });
  const filteredRules = order.orderedRules.filter((rule) => matchesRuleFilters(rule, filters));

  const selectedRule = selected?.rule;
  const handleOpenCreate = () => {
    setCreateCount((prev) => prev + 1);
    setIsCreateOpen(true);
  };
  const closeSelected = () => setSelected(null);

  const runRuleMutation = async (request, fallbackMessage) => {
    try {
      const res = await request.unwrap();
      toast.success(res?.message || fallbackMessage);
      closeSelected();
    } catch (error) {
      console.error("Rule action error:", error);
      toast.error(error?.data?.message || "Something went wrong with this rule");
    }
  };

  const menuButtons = buildMenuButtons({
    canUpdateRule,
    canDeleteRule,
    onSelect: (rule, action) => {
      setActionMenu(null);
      setSelected({ rule, action });
    },
  });

  const columns = buildRuleColumns({
    actionMenu,
    onToggleMenu: (ruleId) => setActionMenu((prev) => (prev === ruleId ? null : ruleId)),
    menuButtons,
    canReorder: canUpdateRule,
  });

  if (isLoading) return <LoadingState title="Loading rules" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load rules">
        <Button type="button" label="Try again" onClick={refetch} />
      </EmptyState>
    );

  return (
    <article className="flex w-full flex-col gap-6 p-4">
      <ApplicationFormsRuleModal
        key={createCount}
        isOpen={isCreateOpen}
        mode={MODAL_MODES.ADD}
        formId={formId}
        onClose={() => setIsCreateOpen(false)}
      />
      <ApplicationFormsRuleModal
        key={selectedRule?._id}
        isOpen={selected?.action === RULE_ROW_ACTIONS.EDIT}
        mode={MODAL_MODES.EDIT}
        formId={formId}
        initialData={selectedRule}
        onClose={closeSelected}
      />
      <ConfirmationModal
        isOpen={selected?.action === RULE_ROW_ACTIONS.DELETE}
        onClose={closeSelected}
        onConfirm={() => runRuleMutation(deleteRule({ ruleId: selectedRule?._id }), "Rule deleted successfully")}
        title="Delete Rule"
        message="Are you sure you want to delete this rule?"
        isLoading={isDeletingRule}
        confirmButtonText="Delete"
      />
      <ConfirmationModal
        isOpen={selected?.action === RULE_ROW_ACTIONS.STATUS}
        onClose={closeSelected}
        onConfirm={() =>
          runRuleMutation(
            updateStatusRule({ ruleId: selectedRule?._id, isActive: !selectedRule?.isActive }),
            "Rule status updated",
          )
        }
        isLoading={isUpdatingStatusRule}
        title="Update Rule Status"
        message={`Turn this rule ${selectedRule?.isActive ? "off" : "on"}?`}
        confirmButtonText="Update"
      />
      <ConfirmationModal
        isOpen={order.isConfirmOpen}
        onClose={order.closeConfirm}
        onConfirm={order.handleSaveOrder}
        isLoading={order.isSavingOrder}
        title="Update Rules Order"
        message="Save the new order of these rules?"
        confirmButtonText="Save"
      />
      <ConfirmationModal
        isOpen={aiConfirm.isOpen}
        onClose={aiConfirm.close}
        onConfirm={aiConfirm.resolveAsked}
        title={aiConfirm.pending?.title}
        message={aiConfirm.pending?.message}
        confirmButtonText={aiConfirm.pending?.confirmButtonText}
      />

      <ApplicationFormsRulesHeading
        isOrderChanged={canUpdateRule && order.isOrderChanged}
        isSavingOrder={order.isSavingOrder}
        onSaveOrder={order.openConfirm}
        onResetOrder={order.handleResetOrder}
      />
      <ApplicationFormsRulesFilter
        filters={filters}
        setFilters={setFilters}
        onCreateRule={canCreateRule ? handleOpenCreate : null}
      />

      {/* Rules table */}
      <section className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {canUpdateRule && (
          <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-3 pb-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MdDragIndicator size={14} />
              Drag the handle to reorder rules
            </span>
            {order.activeDragId && <span className="animate-pulse text-xs text-blue-600">Dragging rule…</span>}
          </div>
        )}
        <ApplicationFormsRulesTable
          columns={columns}
          data={filteredRules}
          sensors={order.sensors}
          onDragStart={order.handleDragStart}
          onDragEnd={order.handleDragEnd}
          onDragCancel={order.handleDragCancel}
          activeDragId={order.activeDragId}
          isFiltering={hasActiveRuleFilters(filters)}
        />
      </section>
    </article>
  );
};

export default ManageRules;
