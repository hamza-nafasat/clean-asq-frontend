import {
  useDeleteSingleFormRuleMutation,
  useGetAllFormRulesQuery,
  useUpdateRulesOrderMutation,
  useUpdateStatusSingleFormRuleMutation,
} from "@/redux/apis/formApis";
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical, PencilIcon, PlusIcon, ToggleRight, Trash } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import Button from "../shared/small/Button";
import CustomLoading from "../shared/small/CustomLoading";
import { SelectInputType } from "../shared/small/DynamicField";
import Modal from "../shared/small/Modal";
import TextField from "../shared/small/TextField";
import { ThreeDotEditViewDelete } from "../shared/ThreeDotViewEditDelete";
import { CreateRuleModal, UpdateRuleModal } from "./CreateOrUpdateRules";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { label: "Alert", value: "alert" },
  { label: "Display", value: "display" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

// ─── Column Definitions (react-data-table-component style) ───────────────────
const getColumns = ({ actionMenu, setActionMenu, ButtonsForThreeDot }) => [
  {
    name: "",
    width: "20px",
    cell: () => null,
    isDragHandle: true,
  },

  {
    name: "No",
    width: "64px",
    center: true,
    selector: (row) => row.order,
    cell: (row) => <span className="text-textPrimary text-sm">{row.order}</span>,
  },
  {
    name: "Rule Name",
    width: "192px",
    selector: (row) => row.name,
    cell: (row) => <span className="text-textPrimary font-semibold capitalize text-sm">{row.name}</span>,
  },
  {
    name: "Rule Prompt",
    grow: 1, // fills remaining width
    selector: (row) => row.prompt,
    cell: (row) => (
      <textarea
        value={row.prompt}
        readOnly
        className="text-textPrimary border border-frameColor w-full resize-none rounded-md bg-[#FAFBFF] p-2 text-sm"
        rows={2}
      />
    ),
  },
  {
    name: "Category",
    width: "112px",
    selector: (row) => row.category,
    cell: (row) => <span className="font-semibold capitalize text-sm">{row.category}</span>,
  },
  {
    name: "Status",
    width: "96px",
    selector: (row) => row.isActive,
    cell: (row) => (
      <span className={`font-semibold capitalize text-sm ${row.isActive ? "text-green-600" : "text-red-500"}`}>
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    name: "Actions",
    width: "96px",
    cell: (row) => (
      <div className="relative">
        <button
          onClick={() => setActionMenu((prev) => (prev === row._id ? null : row._id))}
          className="cursor-pointer rounded p-1 hover:bg-gray-100"
          aria-label="Actions"
        >
          <MoreVertical size={18} />
        </button>
        {actionMenu === row._id && <ThreeDotEditViewDelete buttons={ButtonsForThreeDot} row={row} />}
      </div>
    ),
  },
];

// ─── Sortable Row ─────────────────────────────────────────────────────────────
const SortableRow = ({ row, columns }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 hover:bg-gray-50 ${isDragging ? "bg-gray-100 shadow-lg" : "bg-white"}`}
    >
      {columns.map((col, idx) => {
        const tdStyle = {};
        if (col.width) tdStyle.width = col.width;

        if (col.isDragHandle) {
          return (
            <td key={idx} style={tdStyle} className="px-3 py-3 text-center">
              <div
                {...attributes}
                {...listeners}
                className="inline-flex cursor-grab active:cursor-grabbing rounded p-1 hover:bg-gray-200 transition-colors"
                title="Drag to reorder"
              >
                <GripVertical size={18} className="text-gray-400" />
              </div>
            </td>
          );
        }

        return (
          <td key={idx} style={tdStyle} className={`px-3 py-3 ${col.center ? "text-center" : ""}`}>
            {col.cell ? col.cell(row) : col.selector?.(row)}
          </td>
        );
      })}
    </tr>
  );
};

// ─── Drag Overlay ─────────────────────────────────────────────────────────────
const DragOverlayRow = ({ row }) => (
  <div className="bg-white shadow-xl rounded-lg border border-blue-200 p-3 min-w-[320px]">
    <div className="flex items-center gap-3">
      <GripVertical size={20} className="text-gray-400" />
      <div className="flex-1">
        <div className="font-semibold text-sm">{row?.name}</div>
        <div className="text-xs text-gray-500">ID: {row?._id?.slice(-6)}</div>
      </div>
      <span className="text-xs text-gray-500">#{row?.order}</span>
    </div>
  </div>
);

// ─── DataTable Component ──────────────────────────────────────────────────────
const DataTable = ({ columns, data, sensors, onDragStart, onDragEnd, onDragCancel, activeDragId }) => (
  <DndContext
    sensors={sensors}
    collisionDetection={closestCenter}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragCancel={onDragCancel}
  >
    <SortableContext items={data.map((r) => r._id)} strategy={verticalListSortingStrategy}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={col.width ? { width: col.width } : {}}
                className={`px-3 py-3 ${col.center ? "text-center" : ""}`}
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                No rules found
              </td>
            </tr>
          ) : (
            data.map((row) => <SortableRow key={row._id} row={row} columns={columns} />)
          )}
        </tbody>
      </table>
    </SortableContext>

    <DragOverlay
      dropAnimation={{
        ...defaultDropAnimation,
        duration: 200,
        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
      }}
    >
      {activeDragId && <DragOverlayRow row={data.find((r) => r._id === activeDragId)} />}
    </DragOverlay>
  </DndContext>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageRules = () => {
  const formId = useParams().formId;
  const [actionMenu, setActionMenu] = useState(null);
  const [openCreateRuleModal, setOpenCreateRuleModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteRuleConfirmation, setDeleteRuleConfirmation] = useState(null);
  const [updateStatusRuleConfirmation, setUpdateStatusRuleConfirmation] = useState(null);
  const [updateRuleConfirmation, setUpdateRuleConfirmation] = useState(null);
  const [filters, setFilters] = useState({ name: "", category: "", status: "" });
  const [orderedRules, setOrderedRules] = useState([]);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);

  const { data: rules, isLoading, refetch } = useGetAllFormRulesQuery({ formId });
  const [deleteRule, { isLoading: isDeletingRule }] = useDeleteSingleFormRuleMutation();
  const [updateStatusRule, { isLoading: isUpdatingStatusRule }] = useUpdateStatusSingleFormRuleMutation();
  const [updateRulesOrder, { isLoading: isUpdatingRulesOrder }] = useUpdateRulesOrderMutation();

  // Sync server data → local state
  useEffect(() => {
    if (rules?.data) {
      setOrderedRules(rules.data);
      setIsOrderChanged(false);
    }
  }, [rules]);

  // Filtered view
  const filteredRules = useMemo(
    () =>
      orderedRules.filter((rule) => {
        const matchName = !filters.name || rule.name?.toLowerCase().includes(filters.name.toLowerCase());
        const matchCategory = !filters.category || rule.category === filters.category;
        const matchStatus =
          !filters.status ||
          (filters.status === "active" && rule.isActive) ||
          (filters.status === "inactive" && !rule.isActive);
        return matchName && matchCategory && matchStatus;
      }),
    [orderedRules, filters],
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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

      const reordered = arrayMove(orderedRules, oldFullIdx, newFullIdx).map((r, i) => ({
        ...r,
        order: i + 1,
      }));

      setOrderedRules(reordered);
      setIsOrderChanged(true);
      // toast.success(`Moved from position ${oldFilteredIdx + 1} to ${newFilteredIdx + 1}`);
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
      console.log("error in handleSaveOrder", err);
      toast.error(err?.data?.message || "Failed to update rules order");
      setIsOrderChanged(false);
    }
  };
  const handleCancelOrder = () => {
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
      toast.error(err?.data?.message || "Failed to delete rule");
    }
  };

  const handleUpdateStatusRule = async (ruleId, isActive) => {
    try {
      const res = await updateStatusRule({ ruleId, isActive: !isActive }).unwrap();
      if (res?.success) {
        toast.success(res.message || "Rule status updated");
        await refetch();
        setUpdateStatusRuleConfirmation(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const ButtonsForThreeDot = useMemo(
    () => [
      {
        name: "Update Status",
        icon: <ToggleRight size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setUpdateStatusRuleConfirmation(true);
        },
      },
      {
        name: "Update Rule",
        icon: <PencilIcon size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setUpdateRuleConfirmation(true);
        },
      },
      {
        name: "Delete",
        icon: <Trash size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setDeleteRuleConfirmation(true);
        },
      },
    ],
    [],
  );

  // ── Build columns (react-data-table-component style) ──────────────────────
  const columns = useMemo(
    () => getColumns({ actionMenu, setActionMenu, ButtonsForThreeDot }),
    [actionMenu, ButtonsForThreeDot],
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

      <div className="p-4">
        <div className="flex w-full flex-col gap-6">
          {/* Filters */}
          <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-center gap-4">
                <h3 className="text-textPrimary text-lg font-semibold">Manage Rules</h3>
                {isOrderChanged && (
                  <div className="flex items-center gap-2">
                    <Button
                      label="Update Order"
                      variant="primary"
                      loading={isUpdatingRulesOrder}
                      size="sm"
                      onClick={handleSaveOrder}
                    />
                    <Button label="Reset Order" variant="secondary" size="sm" onClick={handleCancelOrder} />
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex flex-col w-full md:w-1/3">
                  <label className="text-xs text-gray-500 mb-1">Search</label>
                  <TextField
                    id="search-name"
                    placeholder="Search by rule name..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col w-full md:w-1/4">
                  <label className="text-xs text-gray-500 mb-1">Category</label>
                  <SelectInputType
                    field={{ options: CATEGORY_OPTIONS, uniqueId: "category" }}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    form={{ category: { name: "category", value: filters.category } }}
                  />
                </div>
                <div className="flex flex-col w-full md:w-1/4">
                  <label className="text-xs text-gray-500 mb-1">Status</label>
                  <SelectInputType
                    field={{ options: STATUS_OPTIONS, uniqueId: "status" }}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    form={{ status: { name: "status", value: filters.status } }}
                  />
                </div>
                <div className="flex justify-end items-end">
                  <Button
                    icon={PlusIcon}
                    className="w-40 h-13 rounded-lg"
                    label="Create Rule"
                    variant="primary"
                    onClick={() => setOpenCreateRuleModal(true)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="text-sm text-gray-500 px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-100">
              <span className="inline-flex items-center gap-1">
                <GripVertical size={14} />
                Drag the handle (⠿) to reorder rules
              </span>
              {activeDragId && <span className="text-xs text-blue-600 animate-pulse">Dragging rule…</span>}
            </div>

            {/* ↓ react-data-table-component style: just pass columns + data */}
            <DataTable
              columns={columns}
              data={filteredRules}
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              activeDragId={activeDragId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageRules;
