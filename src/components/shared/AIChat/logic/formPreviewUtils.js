// Maps a DB-shape section (from ctx.currentState.detailedForm.sections) to the
// shape expected by FormPreview.jsx (sectionTitle, sectionName, fields, etc.)
export const toPreviewSection = (s, overrides = {}) => ({
  sectionTitle: s.key || (s.isSignature ? "agreement_blk" : ""),
  sectionName: s.name || s.title || "",
  isHidden: s.isHidden || false,
  isBlock: s.isBlock || false,
  isSignature: s.isSignature || false,
  displayText: s.displayText || "",
  signDisplayText: s.signDisplayText || "",
  fields: (s.fields || []).map((f) => ({
    label: f.label || "",
    type: f.type || "text",
    required: f.required || false,
    placeholder: f.placeholder || "",
    options: f.options || [],
    displayText: f.displayText || "",
    isDisplayText: f.isDisplayText || false,
  })),
  ...overrides,
});
