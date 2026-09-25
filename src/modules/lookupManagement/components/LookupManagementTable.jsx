import { useState } from "react";
import {
  useCreateSearchStrategyDefaultMutation,
  useCreateSearchStrategyMutation,
  useDeleteSearchStrategyMutation,
  useGetAllSearchStrategiesQuery,
  useUpdateSearchStrategyMutation,
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
import LookupManagementAddModal from "./LookupManagementAddModal";
import { DELETE_CLOSE_MODES } from "@/constants";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import {
  ADD_COMPANY_IDENTIFICATION_OPTIONS,
  EDIT_COMPANY_IDENTIFICATION_OPTIONS,
  EXTRACT_AS_OPTIONS,
  LOOKUP_SCREEN_CONTEXT,
} from "@/modules/lookupManagement/utils/lookupManagement.constants";
import { buildLookupColumns } from "@/modules/lookupManagement/utils/lookupManagement.columns";
import {
  buildLookupAssistantActions,
  buildLookupScreenState,
} from "@/modules/lookupManagement/utils/lookupManagement.utils2";

const SERVER_URL = getEnv("SERVER_URL");

const LookupManagementTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const { openRowId: actionMenu, setOpenRowId: setActionMenu, toggleMenu, getRowRef } = useRowActionMenu();
  const [selectedRow, setSelectedRow] = useState();
  const [aiDraftData, setAiDraftData] = useState(null);
  const canCreateLookup = usePermission(PERMISSIONS.CREATE_LOOKUP);
  const canUpdateLookup = usePermission(PERMISSIONS.UPDATE_LOOKUP);
  const canDeleteLookup = usePermission(PERMISSIONS.DELETE_LOOKUP);

  const { data } = useGetAllSearchStrategiesQuery();
  const [createDefaultStrategies, { isLoading: isLoadingCreateDefaultStrategies }] =
    useCreateSearchStrategyDefaultMutation();
  const [deleteSearchStrategy] = useDeleteSearchStrategyMutation();
  const [createSearchStrategy] = useCreateSearchStrategyMutation();
  const [updateSearchStrategy] = useUpdateSearchStrategyMutation();

  useScreenContext({
    ...LOOKUP_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}/api/ai/lookup-chat`,
    currentState: buildLookupScreenState(data?.data),
    actions: buildLookupAssistantActions({
      lookups: data?.data,
      createSearchStrategy,
      updateSearchStrategy,
      onOpenCreateModal: (draftData) => {
        setAiDraftData(draftData || null);
        setIsModalOpen(true);
      },
    }),
    deps: { lookupCount: data?.data?.length },
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
        const res = await deleteSearchStrategy({ SearchStrategyId: selectedRow._id }).unwrap();
        if (res.success) {
          toast.success(res.message);
        }
      } catch (error) {
        console.error("Delete search strategy error:", error);
        toast.error(error?.data?.message || "Failed to delete user");
      }
    },
  });

  const handleCreateDefaultStrategies = async () => {
    try {
      const res = await createDefaultStrategies().unwrap();
      if (res.success) toast.success(res.message);
    } catch (error) {
      console.error("Create default search strategies error:", error);
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const columns = buildLookupColumns({
    actionMenu,
    getRowRef,
    onToggleMenu: toggleMenu,
    onEdit:
      canUpdateLookup &&
      ((row) => {
        setEditModalData(row);
        setActionMenu(null);
        setSelectedRow(row);
      }),
    onDelete:
      canDeleteLookup &&
      ((row) => {
        setDeleteConfirmation(row);
        setActionMenu(null);
        setSelectedRow(row);
      }),
  });

  return (
    <div>
      {canCreateLookup && (
        <div className="mb-4 flex w-full justify-end gap-3">
          <Button onClick={() => setIsModalOpen(true)} label="Add new" />
          <Button
            onClick={handleCreateDefaultStrategies}
            disabled={isLoadingCreateDefaultStrategies}
            label="Create Default"
          />
        </div>
      )}
      <div className="mt-5 w-full lg:w-[calc(100vw-250px)] xl:w-full">
        <AppDataTable
          data={data?.data || []}
          columns={columns}
          pagination
          highlightOnHover
          noDataComponent="No lookup keys yet"
          emptyDescription="Add a lookup key or create the default set."
          className="rounded-lg!"
        />
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <Modal
          hideSaveButton={true}
          hideCancelButton={true}
          title="Add Strategy"
          onClose={() => {
            setIsModalOpen(false);
            setAiDraftData(null);
          }}
        >
          <LookupManagementAddModal
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            selectedRow={aiDraftData}
            companyOptions={ADD_COMPANY_IDENTIFICATION_OPTIONS}
            extractAsOptions={EXTRACT_AS_OPTIONS}
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
          <LookupManagementAddModal
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            selectedRow={selectedRow}
            companyOptions={EDIT_COMPANY_IDENTIFICATION_OPTIONS}
            extractAsOptions={EXTRACT_AS_OPTIONS}
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

export default LookupManagementTable;
