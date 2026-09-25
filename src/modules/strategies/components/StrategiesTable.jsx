import { useState } from "react";
import {
  useCreateFormStrategyMutation,
  useDeleteFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useUpdateFormStrategyMutation,
} from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AppDataTable from "@/components/shared/AppDataTable";
import Modal from "@/components/modals/SaveCancelModal";
import Button from "@/components/shared/Button";
import StrategiesFormModal from "./StrategiesFormModal";
import { DELETE_CLOSE_MODES, MODAL_MODES } from "@/constants";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import { STRATEGIES_SCREEN_CONTEXT } from "@/modules/strategies/utils/strategies.constants";
import { buildStrategiesColumns } from "@/modules/strategies/utils/strategies.columns";
import {
  buildStrategiesScreenState,
  buildStrategyAssistantActions,
  getUnassignedFormOptions,
  toFormOptions,
  toLookupOptions,
} from "@/modules/strategies/utils/strategies.utils";

const SERVER_URL = getEnv("SERVER_URL");

const StrategiesTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const { openRowId: actionMenu, setOpenRowId: setActionMenu, toggleMenu, getRowRef } = useRowActionMenu();
  const [selectedRow, setSelectedRow] = useState();
  const canReadForm = usePermission(PERMISSIONS.READ_FORM);
  const canReadLookup = usePermission(PERMISSIONS.READ_LOOKUP);
  const canDeleteStrategy = usePermission(PERMISSIONS.DELETE_STRATEGY);
  // add and edit need forms and lookups
  const canCreateStrategy = usePermission(PERMISSIONS.CREATE_STRATEGY) && canReadForm && canReadLookup;
  const canUpdateStrategy = usePermission(PERMISSIONS.UPDATE_STRATEGY) && canReadForm && canReadLookup;

  const [createFormStrategy] = useCreateFormStrategyMutation();
  const [updateFormStrategy] = useUpdateFormStrategyMutation();
  const { data: formData } = useGetMyAllFormsQuery(undefined, { skip: !canReadForm });
  const [deleteFormStrategy] = useDeleteFormStrategyMutation();
  const { data: allStrategies } = useGetAllSearchStrategiesQuery(undefined, { skip: !canReadLookup });
  const { data: allFormStrategies } = useGetAllFormStrategiesQuery();

  useScreenContext({
    ...STRATEGIES_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}/api/ai/strategy-chat`,
    currentState: buildStrategiesScreenState({
      formStrategies: allFormStrategies?.data,
      lookups: allStrategies?.data,
      forms: formData?.data,
    }),
    actions: {
      ...buildStrategyAssistantActions({
        formStrategies: allFormStrategies?.data,
        createFormStrategy,
        updateFormStrategy,
      }),
      linkStrategyToForm: async ({ strategyId, formIds }) => {
        const strategy = allFormStrategies?.data?.find((s) => s._id === strategyId);
        if (!strategy) throw new Error("Strategy not found");
        try {
          const res = await updateFormStrategy({
            FormStrategyId: strategyId,
            data: {
              name: strategy.name,
              form: formIds,
              searchStrategies: (strategy.searchStrategies || []).map((s) => s._id),
            },
          }).unwrap();
          if (!res.success) throw new Error(res.message);
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to link strategy");
          throw err;
        }
      },
    },
    deps: {
      strategyCount: allFormStrategies?.data?.length,
      lookupCount: allStrategies?.data?.length,
      formCount: formData?.data?.length,
    },
  });

  const {
    target: deleteConfirmation,
    openConfirmation: setDeleteConfirmation,
    closeConfirmation,
    handleConfirm: handleDelete,
  } = useDeleteConfirmation({
    closeOn: DELETE_CLOSE_MODES.FINALLY,
    onDelete: async () => {
      if (!selectedRow) return toast.error("Please select a row");
      try {
        const res = await deleteFormStrategy({ FormStrategyId: selectedRow?._id }).unwrap();
        if (res.success) {
          toast.success(res.message);
        }
      } catch (error) {
        console.error("Delete strategy error:", error);
        toast.error(error?.data?.message || "Failed to delete form strategy");
      }
    },
  });

  const columns = buildStrategiesColumns({
    forms: canReadForm ? formData?.data : null,
    actionMenu,
    getRowRef,
    onToggleMenu: toggleMenu,
    onEdit:
      canUpdateStrategy &&
      ((row) => {
        setEditModalData(row);
        setActionMenu(null);
        setSelectedRow(row);
      }),
    onDelete:
      canDeleteStrategy &&
      ((row) => {
        setDeleteConfirmation(row);
        setActionMenu(null);
        setSelectedRow(row);
      }),
  });

  return (
    <div>
      {canCreateStrategy && (
        <div className="mt-5 mb-4 flex w-full justify-end gap-3">
          <Button onClick={() => setIsModalOpen(true)} label="Add new" />
        </div>
      )}
      <AppDataTable
        data={allFormStrategies?.data || []}
        columns={columns}
        pagination
        highlightOnHover
        noDataComponent="No data found"
        className="rounded-lg!"
      />

      {/* Add Modal */}
      {isModalOpen && (
        <Modal hideSaveButton={true} hideCancelButton={true} title="Add Strategy" onClose={() => setIsModalOpen(false)}>
          <StrategiesFormModal
            mode={MODAL_MODES.ADD}
            onClose={setIsModalOpen}
            forms={getUnassignedFormOptions(allFormStrategies?.data, formData?.data)}
            formKeys={toLookupOptions(allStrategies?.data)}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editModalData && (
        <Modal
          hideSaveButton={true}
          hideCancelButton={true}
          title="Edit Strategy"
          saveButtonText="Save"
          onClose={() => setEditModalData(null)}
        >
          <StrategiesFormModal
            mode={MODAL_MODES.EDIT}
            onClose={setEditModalData}
            selectedRow={selectedRow}
            forms={toFormOptions(formData?.data)}
            formKeys={toLookupOptions(allStrategies?.data)}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={closeConfirmation}
        onConfirm={handleDelete}
        title="Delete Strategy"
        message={`Are you sure you want to delete ${deleteConfirmation?.searchObjectKey}?`}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
    </div>
  );
};

export default StrategiesTable;
