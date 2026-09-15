import { useState } from "react";
import { HELP_SECTIONS } from "../utils/testing.data";

const TestingHelpPanel = ({ onClose }) => {
  const [expanded, setExpanded] = useState({});

  const toggleSection = (title) => setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <aside className="rounded-xl border border-blue-100 bg-blue-50 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-blue-900">How to use Automated Testing</h2>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="text-blue-400 hover:text-blue-700 text-lg leading-none bg-transparent border-0 cursor-pointer"
          aria-label="Close help"
        >
          ×
        </button>
      </header>
      <div className="flex flex-col gap-1.5">
        {HELP_SECTIONS.map((s) => (
          <div key={s.title} className="rounded-lg border border-blue-100 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(s.title)}
              aria-expanded={!!expanded[s.title]}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-blue-800 hover:bg-blue-50 transition-colors bg-transparent border-0 cursor-pointer"
            >
              <span>{s.title}</span>
              <span className="text-blue-400 text-xs">{expanded[s.title] ? "▲" : "▼"}</span>
            </button>
            {expanded[s.title] && (
              <p className="px-3 pb-3 text-xs leading-relaxed text-gray-600 border-t border-blue-50">{s.body}</p>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default TestingHelpPanel;
