import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useDeleteSearchStrategyMutation, useUpdateSearchStrategyMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import LookupManagementAddEditModal from "./LookupManagementAddEditModal";
import { MODAL_MODES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";
import { TABLE_WRAPPER_RADII } from "@/utils/tableStyles";
import { buildLookupColumns } from "../utils/lookupManagement.columns";

const LookupManagementTable = ({ lookups = [], isLoading = false, isError = false, onRetry }) => {
  const [lookupToEdit, setLookupToEdit] = useState(null);
  const [lookupToDelete, setLookupToDelete] = useState(null);
  const { openRowId, setOpenRowId, toggleMenu, getRowRef } = useRowActionMenu({
    closeOnOutsideClick: true,
  });
  const canUpdateLookup = usePermission(PERMISSIONS.UPDATE_LOOKUP);
  const canDeleteLookup = usePermission(PERMISSIONS.DELETE_LOOKUP);
  const [updateSearchStrategy, { isLoading: isUpdating }] = useUpdateSearchStrategyMutation();
  const [deleteSearchStrategy, { isLoading: isDeleting }] = useDeleteSearchStrategyMutation();

  // close menu before each action
  const closeMenuThen = (action) => (row) => {
    setOpenRowId(null);
    action(row);
  };

  const handleUpdate = async (lookup) => {
    try {
      const res = await updateSearchStrategy({
        SearchStrategyId: lookupToEdit._id,
        data: { ...lookup, _id: lookupToEdit._id },
      }).unwrap();
      if (!res?.success) return;
      toast.success(res.message);
      setLookupToEdit(null);
    } catch (error) {
      console.error("Update lookup key error:", error);
      toast.error(error?.data?.message || "Failed to update lookup key");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteSearchStrategy({
        SearchStrategyId: lookupToDelete._id,
      }).unwrap();
      if (res.success) toast.success(res.message);
    } catch (error) {
      console.error("Delete lookup key error:", error);
      toast.error(error?.data?.message || "Failed to delete lookup key");
    } finally {
      setLookupToDelete(null);
    }
  };

  const columns = buildLookupColumns({
    openRowId,
    getRowRef,
    onToggleMenu: toggleMenu,
    onEdit: canUpdateLookup && closeMenuThen(setLookupToEdit),
    onDelete: canDeleteLookup && closeMenuThen(setLookupToDelete),
  });

  if (isLoading) return <LoadingState title="Loading lookup keys" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load lookup keys">
        <Button type="button" label="Try again" onClick={onRetry} />
      </EmptyState>
    );

  return (
    <>
      <AppDataTable
        data={lookups}
        columns={columns}
        pagination
        wrapperRadius={TABLE_WRAPPER_RADII.TOP_XL}
        highlightOnHover
        persistTableHead
        responsive
        noDataComponent="No lookup keys yet"
        emptyDescription="Add a lookup key or create the default set."
      />

      <LookupManagementAddEditModal
        isOpen={Boolean(lookupToEdit)}
        mode={MODAL_MODES.EDIT}
        initialData={lookupToEdit}
        onClose={() => setLookupToEdit(null)}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />

      <ConfirmationModal
        isOpen={Boolean(lookupToDelete)}
        onClose={() => setLookupToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Lookup Key"
        message={`Are you sure you want to delete "${lookupToDelete?.searchObjectKey}"? This action cannot be undone.`}
        isLoading={isDeleting}
        confirmButtonText="Delete Lookup Key"
      />
    </>
  );
};

export default LookupManagementTable;
