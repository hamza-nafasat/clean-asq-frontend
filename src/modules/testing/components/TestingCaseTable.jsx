import { useState } from "react";
import { ALL_AREAS_FILTER } from "../utils/testing.constants";

const BADGE_COLORS = {
  orange: "bg-orange-100 text-orange-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

const HEADER_CELL_CLASSES = "px-3 py-2 font-medium text-gray-500 uppercase tracking-wide";

const Badge = ({ color = "", children }) => (
  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${BADGE_COLORS[color] || ""}`}>{children}</span>
);

const ActionBtn = ({ onClick, title, danger = false, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`h-6 w-6 rounded border text-xs ${
      danger
        ? "border-red-200 bg-white text-red-500 hover:bg-red-50"
        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const matchesSearch = (tc, search) => {
  const q = search.toLowerCase();
  return tc.name.toLowerCase().includes(q) || tc.testId.toLowerCase().includes(q) || tc.area.toLowerCase().includes(q);
};

const TestingCaseTable = ({
  testCases = [],
  filterArea = null,
  onFilterArea,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  onNew,
  loading = false,
  areas = [],
}) => {
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const areaFilters = [ALL_AREAS_FILTER, ...areas];

  const visibleCases = testCases.filter((tc) => {
    if (filterArea && filterArea !== ALL_AREAS_FILTER && tc.area !== filterArea) return false;
    return search ? matchesSearch(tc, search) : true;
  });

  const handleDeleteConfirm = () => {
    if (!confirmDelete) return;
    onDelete?.(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {areaFilters.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onFilterArea?.(a === ALL_AREAS_FILTER ? null : a)}
              className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                (filterArea || ALL_AREAS_FILTER) === a
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          aria-label="Search test cases"
          className="ml-auto h-8 rounded border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-primary w-40"
        />
        {onNew && (
          <button
            type="button"
            onClick={() => onNew()}
            className="h-8 rounded-lg bg-primary px-3 text-xs font-medium text-white hover:bg-primary/90"
          >
            + New
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
      ) : visibleCases.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {testCases.length === 0 ? "No test cases yet. Create one or seed from static files." : "No matches."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`${HEADER_CELL_CLASSES} text-left w-4`}></th>
                <th className={`${HEADER_CELL_CLASSES} text-left`}>Test ID</th>
                <th className={`${HEADER_CELL_CLASSES} text-left`}>Name</th>
                <th className={`${HEADER_CELL_CLASSES} text-left`}>Area</th>
                <th className={`${HEADER_CELL_CLASSES} text-center`}>Steps</th>
                <th className={`${HEADER_CELL_CLASSES} text-center`}>Flags</th>
                <th className={`${HEADER_CELL_CLASSES} text-center`}>Active</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleCases.map((tc) => (
                <tr key={tc._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <span
                      className={`block h-2 w-2 rounded-full mx-auto ${tc.isActive ? "bg-green-400" : "bg-gray-300"}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-500">{tc.testId}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{tc.name}</td>
                  <td className="px-3 py-2 text-gray-500">{tc.area}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{tc.stepCount ?? tc.steps?.length ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {tc.smoke && <Badge color="orange">smoke</Badge>}
                      {tc.requiresLogin && <Badge color="blue">login</Badge>}
                      {tc.requiresFormUrl && <Badge color="purple">form</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive?.(tc._id, tc.isActive)}
                      disabled={!onToggleActive}
                      aria-label="Toggle active"
                      aria-pressed={!!tc.isActive}
                      className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed ${
                        tc.isActive ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform ${
                          tc.isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      {onEdit && (
                        <ActionBtn onClick={() => onEdit(tc)} title="Edit">
                          ✎
                        </ActionBtn>
                      )}
                      {onDuplicate && (
                        <ActionBtn onClick={() => onDuplicate(tc)} title="Duplicate">
                          ⧉
                        </ActionBtn>
                      )}
                      {onDelete && (
                        <ActionBtn
                          onClick={() => setConfirmDelete({ id: tc._id, name: tc.name })}
                          title="Delete"
                          danger
                        >
                          ×
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Delete test case?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete <strong>{confirmDelete.name}</strong>. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingCaseTable;
