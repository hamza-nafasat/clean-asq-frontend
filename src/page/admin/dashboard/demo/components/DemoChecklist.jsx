import { useState } from "react";
import { FiChevronDown, FiChevronRight, FiClock } from "react-icons/fi";

/**
 * DemoChecklist — feature selection panel (left side only).
 * Shows features grouped by category with checkboxes.
 *
 * Props:
 *   features        – flat array of feature definitions from /api/demo/features
 *   categories      – ordered array of category names
 *   selectedSteps   – array of { featureId, enabled, order }
 *   onChange        – (updatedSteps) => void
 */
export default function DemoChecklist({ features = [], categories = [], selectedSteps = [], onChange }) {
  const [collapsed, setCollapsed] = useState({});

  const stepMap = Object.fromEntries(selectedSteps.map((s) => [s.featureId, s]));

  const toggleCategory = (cat) => setCollapsed((p) => ({ ...p, [cat]: !p[cat] }));

  const toggleFeature = (featureId) => {
    const existing = stepMap[featureId];
    if (existing) {
      onChange(selectedSteps.filter((s) => s.featureId !== featureId));
    } else {
      const maxOrder = selectedSteps.reduce((m, s) => Math.max(m, s.order), -1);
      onChange([...selectedSteps, { featureId, enabled: true, order: maxOrder + 1 }]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">Select features to demo</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const all = features.map((f, i) => ({ featureId: f.id, enabled: true, order: i }));
              onChange(all);
            }}
            className="text-xs text-primary hover:underline"
          >
            Select all
          </button>
          <span className="text-gray-300">|</span>
          <button type="button" onClick={() => onChange([])} className="text-xs text-gray-400 hover:underline">
            Clear
          </button>
        </div>
      </div>

      {categories.map((cat) => {
        const catFeatures = features.filter((f) => f.category === cat);
        const selectedInCat = catFeatures.filter((f) => stepMap[f.id]).length;
        const isOpen = !collapsed[cat];

        return (
          <div key={cat} className="rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                <span className="text-sm font-medium text-gray-700">{cat}</span>
              </div>
              <span className="text-xs text-gray-400">
                {selectedInCat}/{catFeatures.length} selected
              </span>
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-100">
                {catFeatures.map((feature) => {
                  const isSelected = !!stepMap[feature.id];
                  return (
                    <div key={feature.id} className={`px-3 py-2.5 ${isSelected ? "bg-primary/3" : "bg-white"}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFeature(feature.id)}
                          className="mt-0.5 accent-primary cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${isSelected ? "text-gray-800" : "text-gray-600"}`}>
                              {feature.name}
                            </p>
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                              <FiClock size={10} />{feature.estimatedMins}m
                            </span>
                            {feature.naturalPause && (
                              <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 rounded px-1">pause</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
