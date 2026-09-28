const toPreviewField = (field) => ({
  label: field.label,
  type: field.type,
  required: Boolean(field.required),
  placeholder: field.placeholder || "",
  options: field.options || [],
  displayText: field.displayText || "",
  isDisplayText: Boolean(field.isDisplayText),
});

const toPreviewSection = (section) => ({
  sectionTitle: section.title,
  sectionName: section.name,
  isHidden: Boolean(section.isHidden),
  isBlock: Boolean(section.isBlock),
  isSignature: Boolean(section.isSignature),
  displayText: section.displayText || "",
  signDisplayText: section.signDisplayText || "",
  fields: (section.fields || []).map(toPreviewField),
});

// chat preview of a loaded form
export const toFormPreview = (form) => ({
  formName: form.name,
  sections: (form.sections || []).map(toPreviewSection),
});
