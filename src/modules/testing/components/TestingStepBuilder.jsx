import { EMPTY_STEP, STEP_ACTION_FIELDS, STEP_ACTIONS, STEP_FIELDS } from "../utils/testing.constants";

const MOVE_BUTTON_CLASSES =
  "h-6 w-6 rounded border border-gray-200 bg-white text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30";

const StepInput = ({ label, placeholder = "", value = "", onChange, type = "text" }) => (
  <div>
    <label className="mb-0.5 block text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none focus:border-primary"
    />
  </div>
);

const swapSteps = (steps, a, b) => {
  const next = [...steps];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
};

const TestingStepBuilder = ({ steps = [], onChange }) => {
  const update = (index, field, val) => onChange?.(steps.map((s, i) => (i === index ? { ...s, [field]: val } : s)));

  const moveUp = (index) => {
    if (index === 0) return;
    onChange?.(swapSteps(steps, index - 1, index));
  };

  const moveDown = (index) => {
    if (index === steps.length - 1) return;
    onChange?.(swapSteps(steps, index, index + 1));
  };

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const fields = STEP_ACTION_FIELDS[step.action] || {};
        return (
          <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-start gap-2">
              <span className="mt-2 w-5 shrink-0 text-center text-xs font-mono text-gray-400">{i + 1}</span>

              <div className="flex-1 space-y-2">
                {/* Action and controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={step.action}
                    onChange={(e) => update(i, STEP_FIELDS.ACTION, e.target.value)}
                    aria-label="Step action"
                    className="h-8 rounded border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none"
                  >
                    {Object.values(STEP_ACTIONS).map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1 ml-auto">
                    <button
                      type="button"
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      aria-label="Move step up"
                      className={MOVE_BUTTON_CLASSES}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(i)}
                      disabled={i === steps.length - 1}
                      aria-label="Move step down"
                      className={MOVE_BUTTON_CLASSES}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange?.(steps.filter((_, idx) => idx !== i))}
                      aria-label="Remove step"
                      className="h-6 w-6 rounded border border-red-200 bg-white text-xs text-red-500 hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Action fields */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {fields.selector && (
                    <StepInput
                      label="Selector"
                      placeholder='[data-testid="..."]'
                      value={step.selector}
                      onChange={(v) => update(i, STEP_FIELDS.SELECTOR, v)}
                    />
                  )}
                  {fields.value && (
                    <StepInput
                      label={typeof fields.value === "string" ? fields.value : "Value"}
                      value={step.value}
                      onChange={(v) => update(i, STEP_FIELDS.VALUE, v)}
                      type={step.action === STEP_ACTIONS.WAIT_MS ? "number" : "text"}
                    />
                  )}
                  {fields.contains && (
                    <StepInput
                      label={typeof fields.contains === "string" ? fields.contains : "Contains"}
                      value={step.contains}
                      onChange={(v) => update(i, STEP_FIELDS.CONTAINS, v)}
                    />
                  )}
                  {fields.key && (
                    <StepInput
                      label="Storage key"
                      placeholder="e.g. ai-widget-user-closed"
                      value={step.key}
                      onChange={(v) => update(i, STEP_FIELDS.KEY, v)}
                    />
                  )}
                  {fields.message !== undefined && (
                    <StepInput
                      label="Description (optional)"
                      placeholder="Shown in test log"
                      value={step.message}
                      onChange={(v) => update(i, STEP_FIELDS.MESSAGE, v)}
                    />
                  )}
                </div>

                {fields.critical && (
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.critical !== false}
                      onChange={(e) => update(i, STEP_FIELDS.CRITICAL, e.target.checked)}
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
        onClick={() => onChange?.([...steps, { ...EMPTY_STEP }])}
        className="w-full rounded-lg border-2 border-dashed border-gray-200 py-2 text-xs font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        + Add step
      </button>
    </div>
  );
};

export default TestingStepBuilder;
