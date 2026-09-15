import { FiX } from "react-icons/fi";
import DemoActionButton from "./DemoActionButton";

const DemoOutlineChapter = ({ chapter = {}, index = 0, fieldKey = "", onFieldBlur, onRemove, onOpenBuilder }) => (
  <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
      <span className="text-[10px] font-semibold text-gray-400 shrink-0">CH {index + 1}</span>
      <input
        type="text"
        defaultValue={chapter.title || `Chapter ${index + 1}`}
        key={`ch-title-${fieldKey}`}
        placeholder={`Chapter ${index + 1} title`}
        aria-label={`Chapter ${index + 1} title`}
        onBlur={(e) => onFieldBlur?.(index, "title", e.target.value)}
        className="flex-1 text-xs font-semibold text-gray-700 bg-transparent focus:outline-none min-w-0 placeholder:text-gray-400"
      />
      <button
        type="button"
        onClick={() => onRemove?.()}
        className="text-gray-300 hover:text-red-400 shrink-0 transition-colors"
        title="Remove chapter"
        aria-label="Remove chapter"
      >
        <FiX size={12} />
      </button>
    </div>
    <div className="p-3 space-y-2">
      <div>
        <label className="text-[10px] text-gray-400 block mb-1">Narrative notes</label>
        <textarea
          defaultValue={chapter.summary || ""}
          key={`ch-summary-${fieldKey}`}
          rows={2}
          aria-label={`Chapter ${index + 1} narrative notes`}
          placeholder="What the narrator says here — story beats, key points to hit…"
          onBlur={(e) => onFieldBlur?.(index, "summary", e.target.value)}
          className="w-full text-xs rounded border border-gray-100 bg-gray-50 px-2 py-1.5 text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>
      <div>
        <label className="text-[10px] text-gray-400 block mb-1">Demo action</label>
        <DemoActionButton stepCount={chapter.demoAction?.steps?.length || 0} onClick={onOpenBuilder} />
      </div>
    </div>
  </div>
);

export default DemoOutlineChapter;
