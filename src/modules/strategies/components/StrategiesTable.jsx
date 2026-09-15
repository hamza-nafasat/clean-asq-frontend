import { useRef, useState } from "react";
import {
  useCreateFormStrategyMutation,
  useDeleteFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useUpdateFormStrategyMutation,
} from "@/redux/apis/form.apis";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import useBranding from "@/hooks/useBranding";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Modal from "@/components/modals/SaveCancelModal";
import Button from "@/components/shared/Button";
import StrategiesAddModal from "./StrategiesAddModal";
import StrategiesEditModal from "./StrategiesEditModal";
import getEnv from "@/utils/env";
import { getTableStyles } from "@/utils/tableStyles";
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
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const [selectedRow, setSelectedRow] = useState();
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const [createFormStrategy] = useCreateFormStrategyMutation();
  const [updateFormStrategy] = useUpdateFormStrategyMutation();
  const { data: formData } = useGetMyAllFormsQuery();
  const [deleteFormStrategy] = useDeleteFormStrategyMutation();
  const { data: allStrategies } = useGetAllSearchStrategiesQuery();
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

  const handleDelete = async () => {
    if (!selectedRow) return toast.error("Please select a row");
    try {
      const res = await deleteFormStrategy({ FormStrategyId: selectedRow?._id }).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (error) {
      console.error("Delete strategy error:", error);
      toast.error(error?.data?.message || "Failed to delete form strategy");
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const columns = buildStrategiesColumns({
    forms: formData?.data,
    actionMenu,
    actionMenuRefs,
    onToggleMenu: (rowId) => setActionMenu((prev) => (prev === rowId ? null : rowId)),
    onEdit: (row) => {
      setEditModalData(row);
      setActionMenu(null);
      setSelectedRow(row);
    },
    onDelete: (row) => {
      setDeleteConfirmation(row);
      setActionMenu(null);
      setSelectedRow(row);
    },
  });

  return (
    <div>
      <div className="mt-5 mb-4 flex w-full justify-end gap-3">
        <Button onClick={() => setIsModalOpen(true)} label="Add new" />
      </div>
      <DataTable
        data={allFormStrategies?.data || []}
        columns={columns}
        customStyles={tableStyles}
        pagination
        highlightOnHover
        noDataComponent="No data found"
        className="rounded-lg!"
      />

      {/* Add Modal */}
      {isModalOpen && (
        <Modal hideSaveButton={true} hideCancelButton={true} title="Add Strategy" onClose={() => setIsModalOpen(false)}>
          <StrategiesAddModal
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
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
          <StrategiesEditModal
            setEditModalData={setEditModalData}
            selectedRow={selectedRow}
            forms={toFormOptions(formData?.data)}
            formKeys={toLookupOptions(allStrategies?.data)}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
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
