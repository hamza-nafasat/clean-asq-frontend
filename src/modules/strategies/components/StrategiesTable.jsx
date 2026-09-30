import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useDeleteFormStrategyMutation, useUpdateFormStrategyMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import StrategiesFormModal from "./StrategiesFormModal";
import { MODAL_MODES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { TABLE_WRAPPER_RADII } from "@/utils/tableStyles";
import { buildStrategiesColumns } from "../utils/strategies.columns";
import { getAvailableFormOptions } from "../utils/strategies.utils";

const StrategiesTable = ({
  strategies = [],
  visibleStrategies = strategies,
  hasActiveFilters = false,
  forms = null,
  lookupOptions = [],
  canUpdateStrategy = false,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const [strategyToEdit, setStrategyToEdit] = useState(null);
  const [strategyToDelete, setStrategyToDelete] = useState(null);
  const { openRowId, setOpenRowId, toggleMenu, getRowRef } = useRowActionMenu({
    closeOnOutsideClick: true,
  });
  const canDeleteStrategy = usePermission(PERMISSIONS.DELETE_STRATEGY);
  const [updateFormStrategy, { isLoading: isUpdating }] = useUpdateFormStrategyMutation();
  const [deleteFormStrategy, { isLoading: isDeleting }] = useDeleteFormStrategyMutation();

  // close menu before each action
  const closeMenuThen = (action) => (row) => {
    setOpenRowId(null);
    action(row);
  };

  const handleUpdate = async (form) => {
    try {
      const res = await updateFormStrategy({
        FormStrategyId: strategyToEdit._id,
        data: form,
      }).unwrap();
      if (!res?.success) return;
      toast.success(res.message);
      setStrategyToEdit(null);
    } catch (error) {
      console.error("Update strategy error:", error);
      toast.error(error?.data?.message || "Failed to update strategy");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteFormStrategy({
        FormStrategyId: strategyToDelete._id,
      }).unwrap();
      if (res.success) toast.success(res.message);
    } catch (error) {
      console.error("Delete strategy error:", error);
      toast.error(error?.data?.message || "Failed to delete strategy");
    } finally {
      setStrategyToDelete(null);
    }
  };

  const columns = buildStrategiesColumns({
    forms,
    openRowId,
    getRowRef,
    onToggleMenu: toggleMenu,
    onEdit: canUpdateStrategy && closeMenuThen(setStrategyToEdit),
    onDelete: canDeleteStrategy && closeMenuThen(setStrategyToDelete),
  });

  if (isLoading) return <LoadingState title="Loading strategies" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load strategies">
        <Button type="button" label="Try again" onClick={onRetry} />
      </EmptyState>
    );

  return (
    <>
      <AppDataTable
        data={visibleStrategies}
        columns={columns}
        pagination
        wrapperRadius={TABLE_WRAPPER_RADII.TOP_XL}
        highlightOnHover
        persistTableHead
        responsive
        noDataComponent={hasActiveFilters ? "No strategies match your filters" : "No strategies yet"}
        emptyDescription={
          hasActiveFilters
            ? "Try changing or clearing the filters."
            : "Create a strategy to bundle lookup keys for your forms."
        }
      />

      <StrategiesFormModal
        isOpen={Boolean(strategyToEdit)}
        mode={MODAL_MODES.EDIT}
        initialData={strategyToEdit}
        onClose={() => setStrategyToEdit(null)}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        forms={getAvailableFormOptions(strategies, forms, strategyToEdit?._id)}
        formKeys={lookupOptions}
      />

      <ConfirmationModal
        isOpen={Boolean(strategyToDelete)}
        onClose={() => setStrategyToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Strategy"
        message={`Are you sure you want to delete "${strategyToDelete?.name}"? This action cannot be undone.`}
        isLoading={isDeleting}
        confirmButtonText="Delete Strategy"
      />
    </>
  );
};

export default StrategiesTable;
