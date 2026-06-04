import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import {
  useCreateFormStrategyMutation,
  useDeleteFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useUpdateFormStrategyMutation,
} from "@/redux/apis/formApis";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import React, { useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import Modal from "../shared/Modal";
import Button from "../shared/small/Button";
import { ThreeDotEditViewDelete } from "../shared/ThreeDotViewEditDelete";
import AddStrategies from "./startegies/AddStrategies";
import EditStrategies from "./startegies/EditStrategies";
import getEnv from "@/lib/env";
import { useScreenContext } from "@/hooks/useScreenContext";
const SERVER_URL = getEnv("SERVER_URL");

function AllStrategies() {
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
    screenId: "strategies",
    screenName: "Strategies",
    assistantName: "Strategy Assistant",
    description:
      "The Strategies screen lets admins bundle one or more lookups (search strategies) into a named Strategy, then link that strategy to one or more application forms. When a form is submitted, the linked strategy's lookups run automatically to extract company data.",
    aiEndpoint: `${SERVER_URL}/api/ai/strategy-chat`,
    greeting: `Hi! I'm your **Strategy Assistant**.\n\nI can help you:\n- **Explain any lookup** so you can decide which to include in a strategy\n- **Recommend lookups** based on what your application form needs to capture\n- **Create a new strategy** — I'll name it, select the right lookups, and save it for you\n- **Link a strategy to an application form**\n\nTell me what you're trying to accomplish and I'll get started!`,
    currentState: {
      strategies: (allFormStrategies?.data || []).map((s) => {
        const activeFormIds = new Set((formData?.data || []).map((f) => String(f._id)));
        return {
          _id: s._id,
          name: s.name,
          isActive: s.isActive,
          lookups: (s.searchStrategies || []).map((l) => ({
            _id: l._id,
            searchObjectKey: l.searchObjectKey,
            searchTerms: l.searchTerms,
            extractAs: l.extractAs,
          })),
          forms: (s.forms || []).map((f) => ({
            _id: f._id,
            name: f.headerText || f.name,
            isStale: !f._id || !activeFormIds.has(String(f._id)),
          })),
        };
      }),
      availableLookups: (allStrategies?.data || []).map((l) => ({
        _id: l._id,
        searchObjectKey: l.searchObjectKey,
        searchTerms: l.searchTerms,
        extractAs: l.extractAs,
        isActive: l.isActive,
      })),
      availableForms: (formData?.data || []).map((f) => ({ _id: f._id, name: f.headerText || f.name })),
    },
    actions: {
      createStrategy: async ({ name, searchStrategyIds, formIds }) => {
        try {
          const res = await createFormStrategy({
            name,
            searchStrategies: searchStrategyIds,
            form: formIds || [],
          }).unwrap();
          if (!res.success) throw new Error(res.message);
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to create strategy");
          throw err;
        }
      },
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
      createStrategyAndMoveForm: async ({ name, searchStrategyIds, freeFormIds, formsToMove }) => {
        try {
          // Create the strategy with only free forms first
          const createRes = await createFormStrategy({
            name,
            searchStrategies: searchStrategyIds,
            form: freeFormIds || [],
          }).unwrap();
          const newStrategyId = createRes?.data?._id;
          if (!newStrategyId) throw new Error("Could not retrieve new strategy ID");

          // Move each conflicted form: remove from old strategy, add to new
          for (const { formId, fromStrategyId } of formsToMove || []) {
            const fromStrategy = allFormStrategies?.data?.find((s) => s._id === fromStrategyId);
            if (!fromStrategy) continue;
            const remainingForms = (fromStrategy.forms || []).map((f) => f._id).filter((id) => id !== formId);
            await updateFormStrategy({
              FormStrategyId: fromStrategyId,
              data: {
                name: fromStrategy.name,
                form: remainingForms,
                searchStrategies: (fromStrategy.searchStrategies || []).map((s) => s._id),
              },
            }).unwrap();
            await updateFormStrategy({
              FormStrategyId: newStrategyId,
              data: {
                name,
                form: [...(freeFormIds || []), formId],
                searchStrategies: searchStrategyIds,
              },
            }).unwrap();
          }
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to create strategy");
          throw err;
        }
      },
      moveFormToStrategy: async ({ formIds, fromStrategyId, toStrategyId }) => {
        const fromStrategy = allFormStrategies?.data?.find((s) => s._id === fromStrategyId);
        const toStrategy = allFormStrategies?.data?.find((s) => s._id === toStrategyId);
        if (!fromStrategy) throw new Error("Source strategy not found");
        if (!toStrategy) throw new Error("Destination strategy not found");
        try {
          // Remove forms from source strategy
          const remainingForms = (fromStrategy.forms || []).map((f) => f._id).filter((id) => !formIds.includes(id));
          await updateFormStrategy({
            FormStrategyId: fromStrategyId,
            data: {
              name: fromStrategy.name,
              form: remainingForms,
              searchStrategies: (fromStrategy.searchStrategies || []).map((s) => s._id),
            },
          }).unwrap();
          // Add forms to destination strategy
          const newForms = [...(toStrategy.forms || []).map((f) => f._id), ...formIds];
          await updateFormStrategy({
            FormStrategyId: toStrategyId,
            data: {
              name: toStrategy.name,
              form: newForms,
              searchStrategies: (toStrategy.searchStrategies || []).map((s) => s._id),
            },
          }).unwrap();
        } catch (err) {
          toast.error(err?.data?.message || err?.message || "Failed to move form");
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
      console.error("Error deleting form strategy:", error);
      toast.error(error?.data?.message || "Failed to delete form strategy");
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const getAllFormDontAlreadyAdded = (stratigies, forms) => {
    const allFormsAddedInStrategies = stratigies
      ?.map((item) => item?.forms)
      ?.flat()
      ?.map((item) => item?._id);
    const allForms =
      forms
        ?.map((item) => ({ label: item?.name, value: item?._id }))
        ?.filter((item) => !allFormsAddedInStrategies?.includes(item?.value)) || [];
    return allForms;
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row?.name || "",
      sortable: true,
    },
    {
      name: "Form",
      cell: (row) => {
        const activeFormIds = new Set((formData?.data || []).map((f) => String(f._id)));
        const parts = (row?.forms || []).map((item, i) => {
          const isStale = !item?._id || !activeFormIds.has(String(item._id));
          return isStale ? (
            <span
              key={i}
              className="text-amber-600"
              title="This form no longer exists — the strategy has a stale reference"
            >
              {item?.headerText || item?.name || "(deleted)"} ⚠
            </span>
          ) : (
            <span key={i}>{item?.headerText || item?.name}</span>
          );
        });
        if (!parts.length) return <span className="text-gray-400">—</span>;
        return (
          <span className="flex flex-wrap gap-x-1">
            {parts.map((p, i) => (i < parts.length - 1 ? [p, <span key={`sep-${i}`}>,&nbsp;</span>] : p))}
          </span>
        );
      },
    },
    {
      name: "Strategies Key",
      cell: (row) =>
        Array.isArray(row?.searchStrategies)
          ? row?.searchStrategies?.map((item) => item?.searchObjectKey).join(", ")
          : "-",
      grow: 2,
      sortable: true,
    },
    {
      name: "Created At",
      sortable: true,

      cell: (row) => new Date(row?.createdAt)?.toLocaleDateString("en-US") || "",
    },
    {
      name: "Updated At",
      cell: (row) => new Date(row?.updatedAt)?.toLocaleDateString("en-US") || "",
    },
    {
      name: "Action",
      cell: (row) => {
        // ✅ Ensure ref exists for this row
        if (!actionMenuRefs.current.has(row.id)) {
          actionMenuRefs.current.set(row.id, React.createRef());
        }
        const rowRef = actionMenuRefs.current.get(row.id);
        const buttons = [
          {
            name: "edit",
            icon: <Pencil size={16} className="mr-2" />,
            onClick: () => {
              setEditModalData(row);
              setActionMenu(null);
              setSelectedRow(row);
            },
          },
          {
            name: "delete",
            icon: <Trash size={16} className="mr-2" />,
            onClick: () => {
              setDeleteConfirmation(row);
              setActionMenu(null);
              setSelectedRow(row);
            },
          },
        ];

        return (
          <div className="relative" ref={rowRef}>
            <button
              onClick={() => setActionMenu((prev) => (prev === row._id ? null : row._id))}
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreVertical className="cursor-pointer" size={18} />
            </button>

            {actionMenu === row._id && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mt-5 mb-4 flex w-full justify-end gap-3">
        <Button onClick={() => setIsModalOpen(true)} label={"Add new"} />
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
          <AddStrategies
            setIsModalOpen={setIsModalOpen}
            setEditModalData={setEditModalData}
            forms={getAllFormDontAlreadyAdded(allFormStrategies?.data, formData?.data)}
            formKeys={allStrategies?.data?.map((item) => ({ label: item?.searchObjectKey, value: item?._id })) || []}
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
          <EditStrategies
            setEditModalData={setEditModalData}
            selectedRow={selectedRow}
            forms={formData?.data?.map((item) => ({ label: item?.name, value: item?._id })) || []}
            formKeys={allStrategies?.data?.map((item) => ({ label: item?.searchObjectKey, value: item?._id })) || []}
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
}

export default AllStrategies;
