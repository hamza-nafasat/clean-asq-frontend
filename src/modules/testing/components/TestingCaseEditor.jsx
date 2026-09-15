import { useEffect, useState } from "react";
import TestingStepBuilder from "./TestingStepBuilder";
import {
  DEFAULT_TEST_AREAS,
  EMPTY_TEST_CASE,
  TEST_CASE_FIELDS,
  TEST_CASE_FLAGS,
  TEST_ID_PATTERN,
} from "../utils/testing.constants";

const getInputClasses = (error) =>
  `h-9 w-full rounded border ${error ? "border-red-400" : "border-gray-300"} bg-white px-3 text-sm text-gray-700 outline-none focus:border-primary`;

const EditorField = ({ label, error = "", children }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
    {children}
    {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
  </div>
);

const validateTestCase = (form) => {
  const errors = {};
  if (!form.testId.trim()) errors.testId = "Required";
  else if (!TEST_ID_PATTERN.test(form.testId.trim()))
    errors.testId = 'Use format: area.test-name (e.g. "auth.login-valid")';
  if (!form.name.trim()) errors.name = "Required";
  if (!form.area.trim()) errors.area = "Required";
  if (form.steps.length === 0) errors.steps = "Add at least one step";
  return errors;
};

const TestingCaseEditor = ({ isOpen = false, testCase = null, onSave, onClose, saving = false, areas = [] }) => {
  const [form, setForm] = useState(EMPTY_TEST_CASE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(testCase ? { ...EMPTY_TEST_CASE, ...testCase } : { ...EMPTY_TEST_CASE });
      setErrors({});
    }
  }, [isOpen, testCase]);

  if (!isOpen) return null;

  const setField = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSave = () => {
    const nextErrors = validateTestCase(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSave?.(form);
  };

  const isEdit = !!testCase;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <article className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? "Edit Test Case" : "New Test Case"}</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EditorField label="Test ID *" error={errors.testId}>
              <input
                type="text"
                value={form.testId}
                onChange={(e) => setField(TEST_CASE_FIELDS.TEST_ID, e.target.value)}
                placeholder="e.g. auth.login-valid"
                disabled={isEdit}
                className={getInputClasses(errors.testId) + (isEdit ? " bg-gray-50 text-gray-400" : "")}
              />
            </EditorField>
            <EditorField label="Name *" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField(TEST_CASE_FIELDS.NAME, e.target.value)}
                placeholder="Human-readable test name"
                className={getInputClasses(errors.name)}
              />
            </EditorField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EditorField label="Area *" error={errors.area}>
              <input
                type="text"
                list="area-suggestions"
                value={form.area}
                onChange={(e) => setField(TEST_CASE_FIELDS.AREA, e.target.value)}
                placeholder="Pick existing or type new…"
                className={getInputClasses(errors.area)}
              />
              <datalist id="area-suggestions">
                {[...new Set([...DEFAULT_TEST_AREAS, ...areas])].map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </EditorField>
            <EditorField label="Description">
              <input
                type="text"
                value={form.description}
                onChange={(e) => setField(TEST_CASE_FIELDS.DESCRIPTION, e.target.value)}
                placeholder="What this test verifies"
                className={getInputClasses()}
              />
            </EditorField>
          </div>

          <div className="flex flex-wrap gap-5">
            {TEST_CASE_FLAGS.map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!form[field]}
                  onChange={(e) => setField(field, e.target.checked)}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Steps</span>
              {errors.steps && <span className="text-xs text-red-500">{errors.steps}</span>}
            </div>
            <TestingStepBuilder steps={form.steps} onChange={(s) => setField(TEST_CASE_FIELDS.STEPS, s)} />
          </section>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={() => onClose?.()}
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
        </footer>
      </article>
    </div>
  );
};

export default TestingCaseEditor;
