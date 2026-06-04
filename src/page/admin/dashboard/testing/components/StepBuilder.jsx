const ACTIONS = [
  "navigate", "reload", "wait-for", "wait-ms",
  "fill", "fill-persona-fields", "click", "blur", "select",
  "scroll-to", "scroll-to-bottom", "clear-session-storage",
  "verify-exists", "verify-not-exists", "verify-text",
  "verify-url", "verify-not-url", "verify-any-filled",
];

// Which fields are relevant for each action
const FIELDS = {
  "navigate":               { value: "Path / URL",  },
  "reload":                 {},
  "wait-for":               { selector: "Selector", critical: true },
  "wait-ms":                { value: "Milliseconds" },
  "fill":                   { selector: "Selector", value: "Text to type", message: true, critical: true },
  "fill-persona-fields":    { message: true },
  "click":                  { selector: "Selector", message: true, critical: true },
  "blur":                   { selector: "Selector" },
  "select":                 { selector: "Selector", value: "Option value", critical: true },
  "scroll-to":              { selector: "Selector" },
  "scroll-to-bottom":       {},
  "clear-session-storage":  { key: "Storage key" },
  "verify-exists":          { selector: "Selector", message: true },
  "verify-not-exists":      { selector: "Selector", message: true },
  "verify-text":            { selector: "Selector", contains: "Expected text", message: true },
  "verify-url":             { contains: "URL substring", message: true },
  "verify-not-url":         { contains: "URL substring", message: true },
  "verify-any-filled":      { message: true },
};

const EMPTY_STEP = { action: "navigate", selector: "", value: "", contains: "", message: "", critical: true, key: "" };

export default function StepBuilder({ steps, onChange }) {
  const update = (index, field, val) => {
    const next = steps.map((s, i) => i === index ? { ...s, [field]: val } : s);
    onChange(next);
  };

  const addStep = () => onChange([...steps, { ...EMPTY_STEP }]);

  const removeStep = (index) => onChange(steps.filter((_, i) => i !== index));

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...steps];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index) => {
    if (index === steps.length - 1) return;
    const next = [...steps];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const fields = FIELDS[step.action] || {};
        return (
          <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-start gap-2">
              {/* Step number */}
              <span className="mt-2 w-5 shrink-0 text-center text-xs font-mono text-gray-400">{i + 1}</span>

              {/* Fields */}
              <div className="flex-1 space-y-2">
                {/* Action + reorder + delete row */}
                <div className="flex items-center gap-2">
                  <select
                    value={step.action}
                    onChange={(e) => update(i, "action", e.target.value)}
                    className="h-8 rounded border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none"
                  >
                    {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>

                  <div className="flex gap-1 ml-auto">
                    <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                      className="h-6 w-6 rounded border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => moveDown(i)} disabled={i === steps.length - 1}
                      className="h-6 w-6 rounded border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => removeStep(i)}
                      className="h-6 w-6 rounded border border-red-200 bg-white text-xs text-red-500 hover:bg-red-50">×</button>
                  </div>
                </div>

                {/* Conditional fields */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {fields.selector && (
                    <StepInput
                      label="Selector"
                      placeholder='[data-testid="..."]'
                      value={step.selector}
                      onChange={(v) => update(i, "selector", v)}
                    />
                  )}
                  {fields.value && (
                    <StepInput
                      label={typeof fields.value === "string" ? fields.value : "Value"}
                      placeholder=""
                      value={step.value}
                      onChange={(v) => update(i, "value", v)}
                      type={step.action === "wait-ms" ? "number" : "text"}
                    />
                  )}
                  {fields.contains && (
                    <StepInput
                      label={typeof fields.contains === "string" ? fields.contains : "Contains"}
                      placeholder=""
                      value={step.contains}
                      onChange={(v) => update(i, "contains", v)}
                    />
                  )}
                  {fields.key && (
                    <StepInput
                      label="Storage key"
                      placeholder="e.g. ai-widget-user-closed"
                      value={step.key}
                      onChange={(v) => update(i, "key", v)}
                    />
                  )}
                  {fields.message !== undefined && (
                    <StepInput
                      label="Description (optional)"
                      placeholder="Shown in test log"
                      value={step.message}
                      onChange={(v) => update(i, "message", v)}
                    />
                  )}
                </div>

                {/* Critical toggle */}
                {fields.critical && (
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.critical !== false}
                      onChange={(e) => update(i, "critical", e.target.checked)}
                      className="rounded"
                    />
                    Critical (stop test on failure)
                  </label>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addStep}
        className="w-full rounded-lg border-2 border-dashed border-gray-200 py-2 text-xs font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        + Add step
      </button>
    </div>
  );
}

function StepInput({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none focus:border-primary"
      />
    </div>
  );
}
