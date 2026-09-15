import { FiChevronDown, FiPlus, FiRefreshCw, FiSave, FiTrash2 } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { formatDemoDate } from "../utils/demo.utils3";

const DemoPresetBar = ({
  presetName = "",
  presets = [],
  activePreset = null,
  showPresetDropdown = false,
  hasSelection = false,
  hasSavedScript = false,
  savedScriptDate = null,
  isStarting = false,
  personalityPrompt = "",
  onPresetNameChange,
  onSavePreset,
  onToggleDropdown,
  onLoadPreset,
  onDeletePreset,
  onNewDemo,
  onRegenerate,
  onStartDemo,
  onPersonalityPromptChange,
}) => (
  <section className="shrink-0 border-b border-gray-200 bg-white px-5 py-3 space-y-3">
    {/* Preset row */}
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        value={presetName}
        onChange={(e) => onPresetNameChange?.(e.target.value)}
        placeholder="Demo name (e.g. Credit Union Pitch)"
        className="flex-1 min-w-40 rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <button
        type="button"
        onClick={() => onSavePreset?.()}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
      >
        <FiSave size={13} /> {activePreset?._id ? "Update" : "Save"}
      </button>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => onToggleDropdown?.()}
          disabled={!presets.length}
          aria-haspopup="listbox"
          aria-expanded={showPresetDropdown}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Load <FiChevronDown size={13} />
        </button>
        {showPresetDropdown && (
          <div className="absolute left-0 top-full mt-1 z-20 min-w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            {presets.map((p) => (
              <div key={p._id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                <button type="button" onClick={() => onLoadPreset?.(p)} className="text-sm text-gray-700 text-left flex-1">
                  <span className="font-medium">{p.name}</span>
                  <span className="block text-xs text-gray-400">
                    {p.steps?.length || 0} steps
                    {p.savedScript?.length ? ` · saved ${formatDemoDate(p.scriptGeneratedAt)}` : " · no script"}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {activePreset?._id && (
        <button
          type="button"
          onClick={() => onDeletePreset?.(activePreset._id)}
          className="flex items-center gap-1.5 rounded-md border border-red-100 px-2.5 py-1.5 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
          title="Delete this demo"
          aria-label="Delete this demo"
        >
          <FiTrash2 size={13} />
        </button>
      )}
      {activePreset?._id && (
        <button
          type="button"
          onClick={() => onNewDemo?.()}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
          title="Clear and start a new demo"
        >
          <FiPlus size={13} /> New
        </button>
      )}
      <div className="flex-1" />
      {hasSelection && (
        <div className="flex items-center gap-2 shrink-0">
          {hasSavedScript && (
            <button
              type="button"
              onClick={() => onRegenerate?.()}
              disabled={isStarting}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <FiRefreshCw size={13} /> Regenerate
            </button>
          )}
          <button
            type="button"
            onClick={() => onStartDemo?.()}
            disabled={isStarting}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isStarting ? (
              <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <HiOutlineSparkles size={13} />
            )}
            {isStarting ? "Generating…" : "Create Script"}
          </button>
        </div>
      )}
    </div>
    {activePreset && (
      <p className="text-xs text-gray-400 -mt-1">
        Active: <span className="font-medium text-gray-600">{activePreset.name}</span>
        {hasSavedScript && <span className="ml-1 text-green-600">· script saved {savedScriptDate}</span>}
        {!hasSavedScript && <span className="ml-1">· no saved script</span>}
      </p>
    )}

    {/* Narrative instructions */}
    <div className="flex items-start gap-2">
      <HiOutlineSparkles className="text-primary mt-0.5 shrink-0" size={14} />
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-700 mb-1">Narrative Instructions</p>
        <textarea
          value={personalityPrompt}
          onChange={(e) => onPersonalityPromptChange?.(e.target.value)}
          rows={2}
          aria-label="Narrative Instructions"
          placeholder="Describe your audience and desired tone — the AI uses this to shape narration for every section…"
          className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>
    </div>
  </section>
);

export default DemoPresetBar;
