import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

export default function TestChecklist({ areas, selectedIds, onChange }) {
  const [collapsed, setCollapsed] = useState({});

  const toggleArea = (areaId) =>
    setCollapsed((prev) => ({ ...prev, [areaId]: !prev[areaId] }));

  const isAreaFullySelected = (area) =>
    area.tests.every((t) => selectedIds.includes(t.id));

  const isAreaPartiallySelected = (area) =>
    area.tests.some((t) => selectedIds.includes(t.id)) && !isAreaFullySelected(area);

  const toggleAreaSelection = (area) => {
    const areaIds = area.tests.map((t) => t.id);
    if (isAreaFullySelected(area)) {
      onChange(selectedIds.filter((id) => !areaIds.includes(id)));
    } else {
      onChange([...new Set([...selectedIds, ...areaIds])]);
    }
  };

  const toggleTest = (testId) => {
    if (selectedIds.includes(testId)) {
      onChange(selectedIds.filter((id) => id !== testId));
    } else {
      onChange([...selectedIds, testId]);
    }
  };

  return (
    <div className="space-y-2" data-testid="test-checklist">
      {areas.map((area) => {
        const fullySelected = isAreaFullySelected(area);
        const partial = isAreaPartiallySelected(area);
        const isOpen = !collapsed[area.id];

        return (
          <div key={area.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            {/* Area header */}
            <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
              <input
                type="checkbox"
                checked={fullySelected}
                ref={(el) => { if (el) el.indeterminate = partial; }}
                onChange={() => toggleAreaSelection(area)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
              <button
                onClick={() => toggleArea(area.id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <span className="text-sm font-semibold text-gray-800">{area.id}</span>
                <span className="text-xs text-gray-400">
                  {area.tests.filter((t) => selectedIds.includes(t.id)).length}/{area.tests.length}
                </span>
                <span className="ml-auto text-gray-400">
                  {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                </span>
              </button>
            </div>

            {/* Test list */}
            {isOpen && (
              <div className="divide-y divide-gray-50">
                {area.tests.map((test) => (
                  <label
                    key={test.id}
                    className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(test.id)}
                      onChange={() => toggleTest(test.id)}
                      className="mt-0.5 h-4 w-4 rounded accent-primary cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">{test.name}</p>
                      {test.description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{test.description}</p>
                      )}
                      <div className="mt-1 flex gap-2">
                        {test.requiresLogin && (
                          <span className="inline-block rounded px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-medium">
                            requires login
                          </span>
                        )}
                        {test.requiresFormUrl && (
                          <span className="inline-block rounded px-1.5 py-0.5 text-[10px] bg-orange-50 text-orange-700 font-medium">
                            requires form URL
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
