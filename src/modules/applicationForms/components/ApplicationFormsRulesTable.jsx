import { closestCenter, defaultDropAnimation, DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";
import EmptyState from "@/components/shared/EmptyState";
import { RULE_DROP_ANIMATION } from "../utils/applicationForms.constants";

const SortableRow = ({ row, columns = [] }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row._id });

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
        const tdStyle = col.width ? { width: col.width } : {};

        if (col.isDragHandle) {
          return (
            <td key={idx} style={tdStyle} className="px-3 py-3 text-center">
              <div
                {...attributes}
                {...listeners}
                className="inline-flex cursor-grab active:cursor-grabbing rounded p-1 hover:bg-gray-200 transition-colors"
                title="Drag to reorder"
                aria-label={`Drag to reorder ${row.name}`}
              >
                <MdDragIndicator size={18} className="text-gray-400" />
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

const DragOverlayRow = ({ row = null }) => (
  <div className="bg-white shadow-xl rounded-lg border border-blue-200 p-3 min-w-[320px]">
    <div className="flex items-center gap-3">
      <MdDragIndicator size={20} className="shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{row?.name}</p>
        <p className="text-xs text-gray-500">ID: {row?._id?.slice(-6)}</p>
      </div>
      <span className="text-xs text-gray-500">#{row?.order}</span>
    </div>
  </div>
);

const ApplicationFormsRulesTable = ({
  columns = [],
  data = [],
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  activeDragId = null,
  isFiltering = false,
}) => (
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
              <td colSpan={columns.length} className="p-4">
                <EmptyState
                  variant="panel"
                  title={isFiltering ? "No rules match your filters" : "No rules yet"}
                  description={
                    isFiltering
                      ? "Try a different name, category or status."
                      : "Create a rule to check applications automatically."
                  }
                />
              </td>
            </tr>
          ) : (
            data.map((row) => <SortableRow key={row._id} row={row} columns={columns} />)
          )}
        </tbody>
      </table>
    </SortableContext>

    <DragOverlay dropAnimation={{ ...defaultDropAnimation, ...RULE_DROP_ANIMATION }}>
      {activeDragId && <DragOverlayRow row={data.find((r) => r._id === activeDragId)} />}
    </DragOverlay>
  </DndContext>
);

export default ApplicationFormsRulesTable;
