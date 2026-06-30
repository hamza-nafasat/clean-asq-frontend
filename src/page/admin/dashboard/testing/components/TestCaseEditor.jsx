import { useState, useEffect } from "react";
import StepBuilder from "./StepBuilder";

const DEFAULT_AREAS = [
  "Authentication",
  "Branding",
  "Form Builder",
  "Email Templates",
  "User Management",
  "Admin Review",
  "Applicant Flow",
  "AI Chat",
];

const EMPTY_CASE = {
  testId: "",
  name: "",
  area: "",
  description: "",
  requiresLogin: false,
  requiresFormUrl: false,
  smoke: false,
  isActive: true,
  steps: [],
};

export default function TestCaseEditor({ isOpen, testCase, onSave, onClose, saving, areas = [] }) {
  const [form, setForm] = useState(EMPTY_CASE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(testCase ? { ...EMPTY_CASE, ...testCase } : { ...EMPTY_CASE });
      setErrors({});
    }
  }, [isOpen, testCase]);

  if (!isOpen) return null;

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const validate = () => {
    const e = {};
    if (!form.testId.trim()) e.testId = "Required";
    else if (!/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(form.testId.trim()))
      e.testId = 'Use format: area.test-name (e.g. "auth.login-valid")';
    if (!form.name.trim()) e.name = "Required";
    if (!form.area.trim()) e.area = "Required";
    if (form.steps.length === 0) e.steps = "Add at least one step";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  const isEdit = !!testCase;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Edit Test Case" : "New Test Case"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* testId + name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Test ID *" error={errors.testId}>
              <input
                type="text"
                value={form.testId}
                onChange={(e) => set("testId", e.target.value)}
                placeholder='e.g. auth.login-valid'
                disabled={isEdit}
                className={inputCls(errors.testId) + (isEdit ? " bg-gray-50 text-gray-400" : "")}
              />
            </Field>
            <Field label="Name *" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Human-readable test name"
                className={inputCls(errors.name)}
              />
            </Field>
          </div>

          {/* area + description */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Area *" error={errors.area}>
              <input
                type="text"
                list="area-suggestions"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="Pick existing or type new…"
                className={inputCls(errors.area)}
              />
              <datalist id="area-suggestions">
                {[...new Set([...DEFAULT_AREAS, ...areas])].map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </Field>
            <Field label="Description">
              <input
                type="text"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What this test verifies"
                className={inputCls()}
              />
            </Field>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-5">
            {[
              { field: "requiresLogin",   label: "Requires Login" },
              { field: "requiresFormUrl", label: "Requires Form URL" },
              { field: "smoke",           label: "Smoke Test" },
              { field: "isActive",        label: "Active" },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!form[field]}
                  onChange={(e) => set(field, e.target.checked)}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>

          {/* Steps */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Steps</span>
              {errors.steps && <span className="text-xs text-red-500">{errors.steps}</span>}
            </div>
            <StepBuilder steps={form.steps} onChange={(s) => set("steps", s)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Test Case"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `h-9 w-full rounded border ${error ? "border-red-400" : "border-gray-300"} bg-white px-3 text-sm text-gray-700 outline-none focus:border-primary`;
}
