import { useState } from "react";

export default function TestCaseTable({
  testCases,
  filterArea,
  onFilterArea,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  onNew,
  loading,
  areas = [],
}) {
  const AREAS = ["All", ...areas];
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

  const visible = testCases.filter((tc) => {
    if (filterArea && filterArea !== "All" && tc.area !== filterArea) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tc.name.toLowerCase().includes(q) || tc.testId.toLowerCase().includes(q) || tc.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDeleteConfirm = () => {
    if (confirmDelete) {
      onDelete(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Area filter pills */}
        <div className="flex flex-wrap gap-1">
          {AREAS.map((a) => {
            const active = (filterArea || "All") === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => onFilterArea(a === "All" ? null : a)}
                className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                  active ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="ml-auto h-8 rounded border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-primary w-40"
        />

        {/* New button */}
        <button
          type="button"
          onClick={onNew}
          className="h-8 rounded-lg bg-primary px-3 text-xs font-medium text-white hover:bg-primary/90"
        >
          + New
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {testCases.length === 0 ? "No test cases yet. Create one or seed from static files." : "No matches."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide w-4"></th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Test ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Area</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wide">Steps</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wide">Flags</th>
                <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wide">Active</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((tc) => (
                <tr key={tc._id} className="hover:bg-gray-50">
                  {/* Status dot */}
                  <td className="px-3 py-2">
                    <span
                      className={`block h-2 w-2 rounded-full mx-auto ${tc.isActive ? "bg-green-400" : "bg-gray-300"}`}
                    />
                  </td>
                  {/* testId */}
                  <td className="px-3 py-2 font-mono text-gray-500">{tc.testId}</td>
                  {/* name */}
                  <td className="px-3 py-2 font-medium text-gray-800">{tc.name}</td>
                  {/* area */}
                  <td className="px-3 py-2 text-gray-500">{tc.area}</td>
                  {/* step count */}
                  <td className="px-3 py-2 text-center text-gray-500">{tc.stepCount ?? tc.steps?.length ?? "—"}</td>
                  {/* flags */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {tc.smoke && <Badge color="orange">smoke</Badge>}
                      {tc.requiresLogin && <Badge color="blue">login</Badge>}
                      {tc.requiresFormUrl && <Badge color="purple">form</Badge>}
                    </div>
                  </td>
                  {/* active toggle */}
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive(tc._id, tc.isActive)}
                      className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
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
                  {/* actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      <ActionBtn onClick={() => onEdit(tc)} title="Edit">
                        ✎
                      </ActionBtn>
                      <ActionBtn onClick={() => onDuplicate(tc)} title="Duplicate">
                        ⧉
                      </ActionBtn>
                      <ActionBtn onClick={() => setConfirmDelete({ id: tc._id, name: tc.name })} title="Delete" danger>
                        ×
                      </ActionBtn>
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
}

function Badge({ color, children }) {
  const colors = {
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colors[color] || ""}`}>{children}</span>;
}

function ActionBtn({ onClick, title, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-6 w-6 rounded border text-xs ${
        danger
          ? "border-red-200 bg-white text-red-500 hover:bg-red-50"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
