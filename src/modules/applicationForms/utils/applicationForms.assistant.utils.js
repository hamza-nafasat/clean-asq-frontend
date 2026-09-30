import { LOCATION_STATUSES } from "@/constants";
import { DEFAULT_HEADER_TEXT_SIZE } from "./applicationForms.constants";
import { applyPendingEdits, hasPendingEdits } from "./applicationForms.pendingEdits.utils";

// names of the targeted forms
export const getFormNames = (forms, formIds) =>
  formIds.map((formId) => forms?.find((form) => form._id === formId)?.name || formId).join(", ");

// forms and website a branding change targets
export const getBrandingTargetNames = (forms, updates) => {
  const formIds = updates.map((update) => update.formId).filter(Boolean);
  const names = formIds.length ? [getFormNames(forms, formIds)] : [];
  if (updates.some((update) => update.applyToHome)) names.push("the website");
  return names.join(" and ");
};

const findLinkedStrategy = (formStrategies, formId) =>
  (formStrategies || []).find((fs) => (fs.forms || []).some((f) => String(f._id ?? f) === String(formId))) || null;

const mapAssistantForm = (f, formStrategies, emailTemplates) => {
  const linkedFormStrategy = findLinkedStrategy(formStrategies, f._id);
  return {
    _id: f._id,
    name: f.name,
    headerText: f.headerText || "",
    headerTextSize: f.headerTextSize || DEFAULT_HEADER_TEXT_SIZE,
    redirectUrl: f.redirectUrl || "",
    branding: f.branding
      ? {
          _id: f.branding._id,
          name: f.branding.name,
          privacyPolicyUrl: f.branding.privacyPolicyUrl || "",
          termsOfServiceUrl: f.branding.termsOfServiceUrl || "",
        }
      : null,
    locationStatus: f.locationStatus || LOCATION_STATUSES.DISABLED,
    locationMessage: f.locationMessage || "",
    locationFormattingInstructions: f.formateTextInstructions || "",
    createdAt: f.createdAt?.split("T")[0],
    emailTemplates: (emailTemplates || [])
      .filter((t) => (t.forms || []).some((tf) => tf._id === f._id))
      .map((t) => ({
        _id: t._id,
        name: t.templateName,
        emailType: t.emailType,
      })),
    linkedStrategy: linkedFormStrategy ? { _id: linkedFormStrategy._id, name: linkedFormStrategy.name } : null,
  };
};

const mapAssistantField = (f) => ({
  _id: f._id,
  label: f.label,
  type: f.type,
  name: f.name || "",
  placeholder: f.placeholder || "",
  required: f.required || false,
  isDisplayText: f.isDisplayText || false,
  displayText: f.displayText || "",
  displayTextFormattingInstructions: f.displayTextFormattingInstructions || "",
  suggestions: f.suggestions || "",
  options: f.options || [],
  isGooglePlaces: f.isGooglePlaces || false,
  aiHelp: f.aiHelp || false,
  minValue: f.minValue,
  maxValue: f.maxValue,
  defaultValue: f.defaultValue || "",
  isMasked: f.isMasked || false,
  signature: f.signature || "",
  aiPrompt: f.aiPrompt || "",
  hasAiResponse: Boolean(f.aiResponse),
  ai_formatting: f.ai_formatting || "",
});

const mapAssistantSection = (s) => ({
  _id: s._id,
  title: s.title,
  name: s.name,
  key: s.key || "",
  isHidden: s.isHidden || false,
  isBlock: s.isBlock || false,
  isSignature: s.isSignature || false,
  isIdMissionQr: s.isIdMissionQr || false,
  displayText: s.displayText || "",
  displayTextFormattingInstructions: s.displayTextFormattingInstructions || "",
  signDisplayText: s.signDisplayText || s.signDisplayFormattedText || "",
  isSignDisplayText: s.isSignDisplayText || false,
  signDisplayTextFormattingInstructions: s.signDisplayTextFormattingInstructions || "",
  aiCustomizablePrompt: s.aiCustomizablePrompt || "",
  ai_formatting: s.aiFormatting ?? s.ai_formatting ?? "",
  isSignAiHelp: s.isSignAiHelp || false,
  signAiPrompt: s.signAiPrompt || "",
  hasSignAiResponse: Boolean(s.signAiResponse),
  ownerSuggestions: s.ownerSuggestions ?? s.ownerSuggesstions ?? [],
  fields: (s.fields || []).map(mapAssistantField),
});

const mapDetailedForm = ({ formData, pendingFormEdits, formStrategies, formId, ruleCount }) => {
  const edits = pendingFormEdits?.formId === formId ? pendingFormEdits : null;
  const effectiveData = applyPendingEdits(formData, edits);
  const linkedStrategy = findLinkedStrategy(formStrategies, formId);
  const strategyLookupKeys = (linkedStrategy?.searchStrategies || []).map((s) => s.searchObjectKey).filter(Boolean);
  return {
    _id: effectiveData._id,
    name: effectiveData.name,
    headerText: effectiveData.headerText || "",
    redirectUrl: effectiveData.redirectUrl || "",
    otpDisplayText: effectiveData.otpDisplayText || "",
    otpDisplayFormatingInstructions: effectiveData.otpDisplayFormatingInstructions || "",
    idMissionDataDisplayText: effectiveData.idMissionDataDisplayText || "",
    idMissionDataDisplayFormatingInstructions: effectiveData.idMissionDataDisplayFormatingInstructions || "",
    companyVerificationDisplayText: effectiveData.companyVerificationDisplayText || "",
    companyVerificationDisplayFormatingInstructions:
      effectiveData.companyVerificationDisplayFormatingInstructions || "",
    ruleCount,
    linkedStrategy: linkedStrategy
      ? {
          _id: linkedStrategy._id,
          name: linkedStrategy.name,
          lookupKeys: strategyLookupKeys,
        }
      : null,
    sections: (effectiveData.sections || []).map(mapAssistantSection),
  };
};

// state the form assistant reads
export const buildFormsAssistantState = ({
  forms,
  brandings,
  emailTemplates,
  formStrategies,
  searchStrategies,
  formRules,
  singleForm,
  singleFormError,
  selectedFormId,
  pendingFormEdits,
}) => ({
  forms: (forms || []).map((f) => mapAssistantForm(f, formStrategies, emailTemplates)),
  availableBrandings: (brandings || []).map((b) => ({
    _id: b._id,
    name: b.name,
    privacyPolicyUrl: b.privacyPolicyUrl || "",
    termsOfServiceUrl: b.termsOfServiceUrl || "",
  })),
  availableEmailTemplates: (emailTemplates || []).map((t) => ({
    _id: t._id,
    name: t.templateName,
    emailType: t.emailType,
    subject: t.subject,
  })),
  formStrategies: (formStrategies || []).map((s) => ({
    _id: s._id,
    name: s.name,
    isActive: s.isActive,
    formIds: (s.forms || []).map((f) => String(f._id ?? f)),
    lookupKeys: (s.searchStrategies || []).map((l) => l.searchObjectKey).filter(Boolean),
  })),
  validLookupKeys: (searchStrategies || []).map((s) => s.searchObjectKey).filter(Boolean),
  hasPendingEdits: hasPendingEdits(pendingFormEdits),
  detailedForm:
    selectedFormId && singleForm
      ? mapDetailedForm({
          formData: singleForm,
          pendingFormEdits,
          formStrategies,
          formId: selectedFormId,
          ruleCount: (formRules || []).length,
        })
      : null,
  detailedFormLoadError: !!(selectedFormId && singleFormError),
});
