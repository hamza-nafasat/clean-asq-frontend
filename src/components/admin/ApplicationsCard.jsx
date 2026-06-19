import { useBranding } from "@/hooks/BrandingContext";
import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/lib/env";
import {
  executeBrandingAssignment,
  executeBrandingAssignments,
  getBrandingSettersFromHook,
  mapHomeBranding,
} from "@/lib/executeBrandingAssignment";
import { effectToBoxShadow, materialToGloss, parseEffectState } from "@/lib/effectPresets";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/authApis";
import { useAddBrandingInFormMutation, useGetAllBrandingsQuery } from "@/redux/apis/brandingApis";
import { useAttachTemplateToFormMutation, useGetAllEmailTemplatesQuery } from "@/redux/apis/emailTemplateApis";
import {
  useCloneFormMutation,
  useCloneFormRulesMutation,
  useCreateFormMutation,
  useDeleteSingleFormMutation,
  useDeleteFormSectionMutation,
  useGetAllFormRulesQuery,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useGetSingleFormQueryQuery,
  useReorderFormSectionsMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useUpdateFormMutation,
  useUpdateFormSectionMutation,
} from "@/redux/apis/formApis";

import { CopyIcon, MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userExist, userNotExist } from "@/redux/slices/authSlice";
import FileUploader from "../applicationVerification/Documents/FileUploader";
import ConfirmationModal from "../shared/ConfirmationModal";
import Button from "../shared/small/Button";
import CustomLoading from "../shared/small/CustomLoading";
import Modal from "../shared/small/Modal";
import TextField from "../shared/small/TextField";
import ApplyBranding from "./brandings/globalBranding/ApplyBranding";
import { LocationModalComponent } from "./varification/LocationStatusModal";

const SERVER_URL = getEnv("SERVER_URL");

function applyPendingEdits(formData, pending) {
  if (!formData || !pending) return formData;
  let sections = [...(formData.sections || [])];

  // Filter deleted sections
  if (pending.deletedSections?.length) {
    sections = sections.filter((s) => !pending.deletedSections.includes(String(s._id)));
  }
  // Apply new ordering
  if (pending.sectionOrder?.length) {
    const orderMap = {};
    pending.sectionOrder.forEach((id, idx) => {
      orderMap[String(id)] = idx;
    });
    sections = [...sections].sort((a, b) => {
      const ai = orderMap[String(a._id)] ?? 9999;
      const bi = orderMap[String(b._id)] ?? 9999;
      return ai - bi;
    });
  }
  // Apply section-level setting overrides
  sections = sections.map((s) => {
    const upd = pending.sectionUpdates?.[String(s._id)];
    return upd ? { ...s, ...upd } : s;
  });
  // Apply field-level overrides
  sections = sections.map((s) => {
    const fieldMap = pending.fieldUpdates?.[String(s._id)];
    if (!fieldMap) return s;
    return {
      ...s,
      fields: (s.fields || []).map((f) => {
        const upd = fieldMap[String(f._id)];
        return upd ? { ...f, ...upd } : f;
      }),
    };
  });

  return { ...formData, sections };
}

export default function ApplicationsCard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const buttonRef = useRef(null);
  const menuButtonRef = useRef(null);
  const brandingCtx = useBranding();
  const { logo } = brandingCtx;
  const brandingSetters = getBrandingSettersFromHook(brandingCtx);
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();

  const dispatchUserRefresh = async (profileRes) => {
    if (profileRes?.success) {
      dispatch(userExist(profileRes.data));
    } else {
      dispatch(userNotExist());
    }
  };

  const [createForm, { isLoading }] = useCreateFormMutation();
  const { data: forms, refetch, isLoading: isLoadingForms } = useGetMyAllFormsQuery();
  const { data: brandings, isLoading: isLoadingBrandings } = useGetAllBrandingsQuery();
  const [addFromBranding, { isLoading: isAddingFromBranding }] = useAddBrandingInFormMutation();
  const [deleteForm] = useDeleteSingleFormMutation();
  const [updateForm] = useUpdateFormMutation();

  const [isDeletingForm, setIsDeletingForm] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [clientQuery, setClientQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchMode, setSearchMode] = useState("client");
  const [creteFormModal, setCreateFormModal] = useState(false);
  const [file, setFile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openFormUpdate, setOpenFormUpdate] = useState(false);
  // const [openSpecialAccess, setOpenSpecialAccess] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedBranding, setSelectedBranding] = useState(null);
  const [onHome, setOnHome] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [formLocationData, setFormLocationData] = useState({
    title: "",
    subtitle: "",
    message: "",
    status: "",
    formatedText: "",
    formatingTextInstructions: "",
  });
  const [renameModal, setRenameModal] = useState(false);
  const [pendingFormName, setPendingFormName] = useState("");

  // new file

  const [cloneFormMutation] = useCloneFormMutation();
  const [cloneFormRulesMutation] = useCloneFormRulesMutation();

  const { data: allEmailTemplates, refetch: refetchEmailTemplates } = useGetAllEmailTemplatesQuery();
  const [attachEmailTemplateMutation] = useAttachTemplateToFormMutation();
  const [selectedFormForEditing, setSelectedFormForEditing] = useState(null);
  const { data: singleFormData, isError: singleFormError } = useGetSingleFormQueryQuery(
    { _id: selectedFormForEditing },
    { skip: !selectedFormForEditing, refetchOnMountOrArgChange: true },
  );
  const { data: formRulesData } = useGetAllFormRulesQuery(
    { formId: selectedFormForEditing },
    { skip: !selectedFormForEditing, refetchOnMountOrArgChange: true },
  );
  const { data: searchStrategies } = useGetAllSearchStrategiesQuery();
  const { data: formStrategies, refetch: refetchFormStrategies } = useGetAllFormStrategiesQuery();
  const [updateFormSection] = useUpdateFormSectionMutation();
  const [updateDeleteCreateFormFields] = useUpdateDeleteCreateFormFieldsMutation();
  const [reorderFormSectionsMutation] = useReorderFormSectionsMutation();
  const [deleteFormSectionMutation] = useDeleteFormSectionMutation();
  const [pendingFormEdits, setPendingFormEdits] = useState(null);

  const homeBranding = mapHomeBranding(user);

  useScreenContext({
    screenId: "application-forms",
    screenName: "Application Forms",
    assistantName: "Form Management Assistant",
    aiEndpoint: `${SERVER_URL}/api/ai/form-chat`,
    greeting: `Hi! I'm your **Form Management Assistant**.\n\nI can help you:\n- **Preview a form** — render a visual overview of any form's structure in the chat\n- **Check form readiness** — audit a form across 8 criteria: branding assigned, email templates attached, lookup strategy & field linkages, section display text, sign display text, owner suggestions on block sections, underwriting rules configured, and AI help configured on fields\n- **Update header text and font size**\n- **Update redirect URLs**\n- **Change branding** on one or all forms\n- **Edit form content** — update section display text, AI prompts, reorder sections, delete sections (changes preview instantly and save when you confirm)\n- **Delete** forms\n- **Clone settings** from one form to another\n- **Clone a form** — create a complete copy of an existing form as a new independent form (including email template attachments), no CSV required\n- **Design a new form CSV** — select an existing CSV as a starting point, discuss changes, preview the structure, and I'll generate a ready-to-upload CSV file\n\nWhat would you like to do?`,
    currentState: {
      forms: (forms?.data || []).map((f) => {
        const fId = String(f._id);
        const linkedFormStrategy =
          (formStrategies?.data || []).find((fs) => (fs.forms || []).some((sf) => String(sf._id ?? sf) === fId)) ||
          null;
        return {
          _id: f._id,
          name: f.name,
          headerText: f.headerText || "",
          headerTextSize: f.headerTextSize || 24,
          redirectUrl: f.redirectUrl || "",
          branding: f.branding
            ? {
                _id: f.branding._id,
                name: f.branding.name,
                privacyPolicyUrl: f.branding.privacyPolicyUrl || "",
                termsOfServiceUrl: f.branding.termsOfServiceUrl || "",
              }
            : null,
          locationStatus: f.locationStatus || "disabled",
          createdAt: f.createdAt?.split("T")[0],
          emailTemplates: (allEmailTemplates?.data || [])
            .filter((t) => (t.forms || []).some((tf) => tf._id === f._id))
            .map((t) => ({ _id: t._id, name: t.templateName, emailType: t.emailType })),
          linkedStrategy: linkedFormStrategy ? { _id: linkedFormStrategy._id, name: linkedFormStrategy.name } : null,
        };
      }),
      availableBrandings: (brandings?.data || []).map((b) => ({
        _id: b._id,
        name: b.name,
        privacyPolicyUrl: b.privacyPolicyUrl || "",
        termsOfServiceUrl: b.termsOfServiceUrl || "",
      })),
      homeBranding,
      availableEmailTemplates: (allEmailTemplates?.data || []).map((t) => ({
        _id: t._id,
        name: t.templateName,
        emailType: t.emailType,
        subject: t.subject,
      })),
      // Raw strategy bundles — the backend uses these to determine which strategy is linked to each form
      formStrategies: (formStrategies?.data || []).map((s) => ({
        _id: s._id,
        name: s.name,
        isActive: s.isActive,
        formIds: (s.forms || []).map((f) => String(f._id ?? f)),
        lookupKeys: (s.searchStrategies || []).map((l) => l.searchObjectKey).filter(Boolean),
      })),
      validLookupKeys: (searchStrategies?.data || []).map((s) => s.searchObjectKey).filter(Boolean),
      hasPendingEdits: !!(
        pendingFormEdits &&
        (Object.keys(pendingFormEdits.sectionUpdates || {}).length ||
          Object.keys(pendingFormEdits.fieldUpdates || {}).length ||
          pendingFormEdits.sectionOrder ||
          pendingFormEdits.deletedSections?.length)
      ),
      detailedForm:
        selectedFormForEditing && singleFormData?.data
          ? (() => {
              const effectiveData = applyPendingEdits(singleFormData.data, pendingFormEdits);
              const linkedStrategy =
                (formStrategies?.data || []).find((fs) =>
                  (fs.forms || []).some((f) => String(f._id ?? f) === String(selectedFormForEditing)),
                ) || null;
              const strategyLookupKeys = (linkedStrategy?.searchStrategies || [])
                .map((s) => s.searchObjectKey)
                .filter(Boolean);
              return {
                _id: effectiveData._id,
                name: effectiveData.name,
                headerText: effectiveData.headerText || "",
                redirectUrl: effectiveData.redirectUrl || "",
                ruleCount: (formRulesData?.data || []).length,
                linkedStrategy: linkedStrategy
                  ? { _id: linkedStrategy._id, name: linkedStrategy.name, lookupKeys: strategyLookupKeys }
                  : null,
                sections: (effectiveData.sections || []).map((s) => ({
                  _id: s._id,
                  title: s.title,
                  name: s.name,
                  key: s.key || "",
                  isHidden: s.isHidden || false,
                  isBlock: s.isBlock || false,
                  isSignature: s.isSignature || false,
                  displayText: s.displayText || "",
                  signDisplayText: s.signDisplayText || s.signFormatedDisplayText || "",
                  aiCustomizablePrompt: s.aiCustomizablePrompt || "",
                  ai_formatting: s.ai_formatting || "",
                  isSignAiHelp: s.isSignAiHelp || false,
                  signAiPrompt: s.signAiPrompt || "",
                  ownerSuggestions: s.ownerSuggesstions || [],
                  fields: (s.fields || []).map((f) => ({
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
                    ai_formatting: f.ai_formatting || "",
                  })),
                })),
              };
            })()
          : null,
      detailedFormLoadError: !!(selectedFormForEditing && singleFormError),
    },
    actions: {
      selectFormForEditing: ({ formId }) => {
        // Briefly reset to null so RTK Query re-fetches fresh data even if
        // this form was already selected — ensures readiness checks are current.
        setSelectedFormForEditing(null);
        setTimeout(() => setSelectedFormForEditing(formId), 0);
      },
      // Preview-mode: accumulate section setting changes locally; nothing written to DB yet.
      updateSectionSettings: ({ updates }) => {
        setPendingFormEdits((prev) => {
          const base = prev || {
            formId: selectedFormForEditing,
            sectionUpdates: {},
            fieldUpdates: {},
            sectionOrder: null,
            deletedSections: [],
          };
          const sectionUpdates = { ...base.sectionUpdates };
          for (const {
            sectionId,
            displayText,
            signDisplayText,
            aiCustomizablePrompt,
            aiFormatting,
            isSignAiHelp,
            signAiPrompt,
            ownerSuggestions,
          } of updates) {
            sectionUpdates[String(sectionId)] = {
              ...(sectionUpdates[String(sectionId)] || {}),
              ...(displayText !== undefined && { displayText }),
              ...(signDisplayText !== undefined && { signDisplayText }),
              ...(aiCustomizablePrompt !== undefined && { aiCustomizablePrompt }),
              ...(aiFormatting !== undefined && { aiFormatting }),
              ...(isSignAiHelp !== undefined && { isSignAiHelp }),
              ...(signAiPrompt !== undefined && { signAiPrompt }),
              ...(ownerSuggestions !== undefined && { ownerSuggestions }),
            };
          }
          return { ...base, sectionUpdates };
        });
      },
      // Preview-mode: accumulate field changes locally; nothing written to DB yet.
      updateFieldSettings: ({ updates }) => {
        setPendingFormEdits((prev) => {
          const base = prev || {
            formId: selectedFormForEditing,
            sectionUpdates: {},
            fieldUpdates: {},
            sectionOrder: null,
            deletedSections: [],
          };
          const fieldUpdates = { ...base.fieldUpdates };
          for (const { sectionId, fields: fieldChanges } of updates) {
            const sectionMap = { ...(fieldUpdates[String(sectionId)] || {}) };
            for (const {
              fieldId,
              label,
              name,
              displayText,
              isDisplayText,
              placeholder,
              aiHelp,
              aiPrompt,
              aiResponse,
              ai_formatting,
            } of fieldChanges) {
              sectionMap[String(fieldId)] = {
                ...(sectionMap[String(fieldId)] || {}),
                ...(label !== undefined && { label }),
                ...(name !== undefined && { name }),
                ...(displayText !== undefined && { displayText }),
                ...(isDisplayText !== undefined && { isDisplayText }),
                ...(placeholder !== undefined && { placeholder }),
                ...(aiHelp !== undefined && { aiHelp }),
                ...(aiPrompt !== undefined && { aiPrompt }),
                ...(aiResponse !== undefined && { aiResponse }),
                ...(ai_formatting !== undefined && { ai_formatting }),
              };
            }
            fieldUpdates[String(sectionId)] = sectionMap;
          }
          return { ...base, fieldUpdates };
        });
      },
      // Preview-mode: store a new section ordering locally.
      reorderSections: ({ sectionOrder }) => {
        setPendingFormEdits((prev) => {
          const base = prev || {
            formId: selectedFormForEditing,
            sectionUpdates: {},
            fieldUpdates: {},
            sectionOrder: null,
            deletedSections: [],
          };
          return { ...base, sectionOrder };
        });
      },
      // Preview-mode: mark a section as deleted locally.
      deleteSection: ({ sectionId }) => {
        setPendingFormEdits((prev) => {
          const base = prev || {
            formId: selectedFormForEditing,
            sectionUpdates: {},
            fieldUpdates: {},
            sectionOrder: null,
            deletedSections: [],
          };
          const deletedSections = base.deletedSections.includes(String(sectionId))
            ? base.deletedSections
            : [...base.deletedSections, String(sectionId)];
          return { ...base, deletedSections };
        });
      },
      // Discard all pending preview edits.
      discardFormEdits: () => {
        setPendingFormEdits(null);
      },
      // Commit all pending preview edits to the database.
      saveFormEdits: async () => {
        const edits = pendingFormEdits;
        if (!edits) return;
        const errors = [];
        const deleted = edits.deletedSections || [];

        // 1. Delete sections
        for (const sectionId of deleted) {
          try {
            const res = await deleteFormSectionMutation({ sectionId }).unwrap();
            if (!res?.success) throw new Error(res?.message);
          } catch (err) {
            errors.push(`Delete section: ${err?.data?.message || err?.message}`);
          }
        }

        // 2. Reorder sections (exclude deleted from the order)
        if (edits.sectionOrder) {
          try {
            const filteredOrder = edits.sectionOrder.filter((id) => !deleted.includes(String(id)));
            const res = await reorderFormSectionsMutation({
              formId: edits.formId,
              sectionOrder: filteredOrder,
            }).unwrap();
            if (!res?.success) throw new Error(res?.message);
          } catch (err) {
            errors.push(`Reorder: ${err?.data?.message || err?.message}`);
          }
        }

        // 3. Section setting updates
        for (const [sectionId, upd] of Object.entries(edits.sectionUpdates || {})) {
          if (deleted.includes(String(sectionId))) continue;
          try {
            const payload = {};
            if (upd.displayText !== undefined) payload.displayText = upd.displayText;
            if (upd.signDisplayText !== undefined) payload.signDisplayText = upd.signDisplayText;
            if (upd.aiCustomizablePrompt !== undefined) payload.aiCustomizablePrompt = upd.aiCustomizablePrompt;
            if (upd.aiFormatting !== undefined) payload.aiFormatting = upd.aiFormatting;
            if (upd.isSignAiHelp !== undefined) payload.isSignAiHelp = upd.isSignAiHelp;
            if (upd.signAiPrompt !== undefined) payload.signAiPrompt = upd.signAiPrompt;
            if (upd.ownerSuggestions?.length) payload.ownerSuggesstions = upd.ownerSuggestions;
            const res = await updateFormSection({ _id: sectionId, data: payload }).unwrap();
            if (!res?.success) throw new Error(res?.message);
          } catch (err) {
            errors.push(`Section ${sectionId}: ${err?.data?.message || err?.message}`);
          }
        }

        // 4. Field updates
        for (const [sectionId, fieldMap] of Object.entries(edits.fieldUpdates || {})) {
          if (deleted.includes(String(sectionId))) continue;
          try {
            const section = singleFormData?.data?.sections?.find((s) => String(s._id) === String(sectionId));
            if (!section) continue;
            const fieldsData = (section.fields || []).map((field) => {
              const upd = fieldMap[String(field._id)];
              if (!upd) return field;
              return {
                ...field,
                ...(upd.label !== undefined && { label: upd.label }),
                ...(upd.name !== undefined && { name: upd.name }),
                ...(upd.displayText !== undefined && { displayText: upd.displayText }),
                ...(upd.isDisplayText !== undefined && { isDisplayText: upd.isDisplayText }),
                ...(upd.placeholder !== undefined && { placeholder: upd.placeholder }),
                ...(upd.aiHelp !== undefined && { aiHelp: upd.aiHelp }),
                ...(upd.aiPrompt !== undefined && { aiPrompt: upd.aiPrompt }),
                ...(upd.aiResponse !== undefined && { aiResponse: upd.aiResponse }),
                ...(upd.ai_formatting !== undefined && { ai_formatting: upd.ai_formatting }),
              };
            });
            const res = await updateDeleteCreateFormFields({ sectionId, fieldsData }).unwrap();
            if (!res?.success) throw new Error(res?.message);
          } catch (err) {
            errors.push(`Fields ${sectionId}: ${err?.data?.message || err?.message}`);
          }
        }

        setPendingFormEdits(null);
        await refetch();
        if (errors.length) throw new Error(`Saved with ${errors.length} error(s): ${errors.join("; ")}`);
      },
      updateForms: async ({ updates }) => {
        const errors = [];
        for (const { formId, ...data } of updates) {
          try {
            const res = await updateForm({ _id: formId, data }).unwrap();
            if (!res?.success) throw new Error(res?.message);
          } catch {
            errors.push(formId);
          }
        }
        await refetch();
        if (errors.length) {
          toast.error(`Failed to update ${errors.length} of ${updates.length} forms`);
          throw new Error(`Failed to update ${errors.length} forms`);
        }
      },
      setFormsBranding: async ({ updates }) => {
        await executeBrandingAssignments({
          updates,
          addBrandingMutation: addFromBranding,
          getUserProfile,
          brandingSetters,
          dispatchUserRefresh,
        });
        await refetch();
      },
      openApplyBrandingModal: ({ brandingId, formId, applyToHome } = {}) => {
        if (formId) setSelectedId(formId);
        if (brandingId) setSelectedBranding(brandingId);
        if (applyToHome !== undefined) setOnHome(!!applyToHome);
        setOpenModal(true);
      },
      setFormsLocation: async ({ updates }) => {
        const errors = [];
        for (const { formId, locationStatus } of updates) {
          try {
            const res = await updateForm({ _id: formId, data: { locationStatus } }).unwrap();
            if (!res?.success) throw new Error(res?.message);
          } catch {
            errors.push(formId);
          }
        }
        await refetch();
        if (errors.length) {
          toast.error(`Failed to update location on ${errors.length} of ${updates.length} forms`);
          throw new Error(`Failed to update location on ${errors.length} forms`);
        }
      },
      deleteForms: async ({ formIds }) => {
        const errors = [];
        for (const formId of formIds) {
          try {
            const res = await deleteForm({ _id: formId }).unwrap();
            if (!res?.success) throw new Error(res?.message);
          } catch {
            errors.push(formId);
          }
        }
        await refetch();
        if (errors.length) {
          toast.error(`Failed to delete ${errors.length} of ${formIds.length} forms`);
          throw new Error(`Failed to delete ${errors.length} forms`);
        }
      },
      cloneForm: async ({ sourceFormId, newName }) => {
        const res = await cloneFormMutation({ sourceFormId, name: newName }).unwrap();
        if (!res?.success) throw new Error(res?.message);
        await Promise.all([refetch(), refetchEmailTemplates(), refetchFormStrategies()]);
        return res.data;
      },
      cloneRules: async ({ sourceFormId, targetFormId }) => {
        const res = await cloneFormRulesMutation({ sourceFormId, targetFormId }).unwrap();
        if (!res?.success) throw new Error(res?.message);
        return res;
      },
      openCreateFormModal: () => {
        setCreateFormModal(true);
        setFile(null);
      },
      attachEmailTemplate: async ({ formId, templateIds }) => {
        const templates = allEmailTemplates?.data || [];
        const errors = [];
        for (const templateId of templateIds) {
          const template = templates.find((t) => t._id === templateId);
          if (!template) {
            errors.push(templateId);
            continue;
          }
          const currentFormIds = (template.forms || []).map((f) => f._id);
          if (currentFormIds.includes(formId)) continue; // already attached
          try {
            await attachEmailTemplateMutation({
              emailTemplateId: templateId,
              formIds: [...currentFormIds, formId],
            }).unwrap();
          } catch {
            errors.push(templateId);
          }
        }
        if (errors.length) throw new Error(`Failed to attach ${errors.length} template(s)`);
      },
      detachEmailTemplate: async ({ formId, templateIds }) => {
        const templates = allEmailTemplates?.data || [];
        const errors = [];
        for (const templateId of templateIds) {
          const template = templates.find((t) => t._id === templateId);
          if (!template) {
            errors.push(templateId);
            continue;
          }
          const currentFormIds = (template.forms || []).map((f) => f._id);
          try {
            await attachEmailTemplateMutation({
              emailTemplateId: templateId,
              formIds: currentFormIds.filter((id) => id !== formId),
            }).unwrap();
          } catch {
            errors.push(templateId);
          }
        }
        if (errors.length) throw new Error(`Failed to detach ${errors.length} template(s)`);
      },
    },
    deps: [
      forms?.data?.length,
      brandings?.data?.length,
      selectedFormForEditing,
      singleFormData,
      singleFormError,
      formRulesData,
      searchStrategies?.data?.length,
      formStrategies?.data?.length,
      (allEmailTemplates?.data || []).reduce((sum, t) => sum + (t.forms || []).length, 0),
      pendingFormEdits,
    ],
  });

  const finalizeFormCreation = async (res) => {
    if (res.data?._id && res.data?.name) {
      await updateForm({ _id: res.data._id, data: { headerText: res.data.name } }).unwrap();
      await refetch();
    }
  };

  const createFormWithCsvHandler = async () => {
    if (!file) return toast.error("Please select a file");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await createForm(formData).unwrap();
      if (res.success) {
        toast.success(res.message);
        await finalizeFormCreation(res);
      }
    } catch (error) {
      console.error("Error creating form:", error);
      const isDuplicate =
        error?.status === 409 ||
        error?.data?.message?.toLowerCase().includes("already") ||
        error?.data?.message?.toLowerCase().includes("duplicate") ||
        error?.data?.message?.toLowerCase().includes("exists");
      if (isDuplicate) {
        const nameFromError = error?.data?.existingName || error?.data?.name || "";
        setPendingFormName(nameFromError);
        setRenameModal(true);
      } else {
        toast.error(error?.data?.message || "Failed to create form");
        setCreateFormModal(false);
      }
    }
  };

  const createFormWithNameOverrideHandler = async () => {
    if (!pendingFormName.trim()) return toast.error("Please enter a form name");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", pendingFormName.trim());
      const res = await createForm(formData).unwrap();
      if (res.success) {
        toast.success(res.message);
        await finalizeFormCreation(res);
        setRenameModal(false);
        setPendingFormName("");
        setCreateFormModal(false);
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error(error?.data?.message || "Failed to create form");
      setPendingFormName("");
    }
  };

  const onConfirmApply = async () => {
    if (!selectedBranding) {
      toast.error("Branding ID is missing");
      return;
    }
    if (!selectedId && !onHome) {
      toast.error("Form ID is required if onHome is not provided");
      return;
    }
    try {
      const res = await executeBrandingAssignment({
        addBrandingMutation: addFromBranding,
        getUserProfile,
        brandingSetters,
        dispatchUserRefresh,
        assignment: {
          brandingId: selectedBranding,
          formId: selectedId || undefined,
          applyToHome: onHome,
        },
      });
      await refetch();
      toast?.success(res?.message || "Branding applied successfully");
    } catch (error) {
      console.error("Error applying branding:", error);
      toast.error(error?.message || error?.data?.message || "Failed to apply branding");
    } finally {
      setOpenModal(false);
      setSelectedId(null);
      setSelectedBranding(null);
      setOnHome(false);
      setActionMenu(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleDeleteForm = async () => {
    try {
      if (!deleteConfirmation) return;
      setIsDeletingForm(true);
      const res = await deleteForm({ _id: deleteConfirmation }).unwrap();
      if (res?.success) {
        await refetch();
        toast?.success(res?.message || "Form deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error(error?.data?.message || "Failed to delete form");
    } finally {
      setDeleteConfirmation(null);
      setIsDeletingForm(false);
    }
  };

  if (isLoadingForms) return <CustomLoading />;

  return (
    <div className="bg-backgroundColor rounded-md p-5 shadow" data-testid="forms-page">
      {/* modal for delete form */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteForm}
        isLoading={isLoading || isDeletingForm}
        title="Delete Form"
        message={`Are you sure you want to delete this form?`}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
      {/* modal for set branding  */}

      {openModal && (
        <ConfirmationModal
          isOpen={!!openModal}
          isLoading={isAddingFromBranding || isLoadingBrandings}
          message={
            <ApplyBranding
              brandings={brandings?.data}
              setSelectedId={setSelectedBranding}
              selectedId={selectedBranding}
              setOnHome={setOnHome}
              onHome={onHome}
            />
          }
          confirmButtonText="Apply Branding"
          confirmButtonClassName="border-none hover:bg-red-600 text-white"
          cancelButtonText="cancel"
          onConfirm={onConfirmApply}
          onClose={() => setOpenModal(false)}
          title={"Apply Branding"}
        />
      )}
      {openFormUpdate && (
        <Modal onClose={() => setOpenFormUpdate(false)} title="Update Form">
          <FormConfigurationModal form={selectedForm} refetch={refetch} setModal={setOpenFormUpdate} />
        </Modal>
      )}

      {locationModal && (
        <Modal onClose={() => setLocationModal(false)} title="Set Location">
          <LocationModalComponent
            locationModal={locationModal}
            setLocationModal={setLocationModal}
            refetch={refetch}
            formLocationData={formLocationData}
          />
        </Modal>
      )}
      {/* modal for create alert */}

      {/* Header Section */}
      {creteFormModal && (
        <Modal onClose={() => setCreateFormModal(false)} title="">
          <FileUploader
            label="Upload Image / PDF / CSV"
            accept=".pdf,image/*,.csv"
            onFileSelect={(file) => setFile(file)}
          />
          <div className="my-2 flex items-center justify-end">
            <Button
              className={`${(!file || isLoading) && "pointer-events-none cursor-not-allowed opacity-50"}`}
              label={"Create "}
              onClick={createFormWithCsvHandler}
            />
          </div>
        </Modal>
      )}
      {renameModal && (
        <Modal
          onClose={() => {
            setRenameModal(false);
            setCreateFormModal(false);
            setPendingFormName("");
          }}
          title="Form Name Already Exists"
        >
          <div className="flex flex-col gap-4 p-4">
            <p className="text-sm text-gray-600">
              A form with this name already exists. Please enter a different name to continue.
            </p>
            <TextField
              label="Form Name"
              placeholder="Enter a unique form name"
              value={pendingFormName}
              onChange={(e) => setPendingFormName(e.target.value)}
              name="form-name-override"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                label="Cancel"
                onClick={() => {
                  setRenameModal(false);
                  setCreateFormModal(false);
                  setPendingFormName("");
                }}
              />
              <Button
                label="Create"
                className={`${(!pendingFormName.trim() || isLoading) && "pointer-events-none cursor-not-allowed opacity-50"}`}
                onClick={createFormWithNameOverrideHandler}
              />
            </div>
          </div>
        </Modal>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-textPrimary text-base font-medium md:text-2xl">
            Financial Services Application Platform
          </h1>
          <p className="text-textPrimary mt-5 text-base font-normal md:text-lg">
            Dynamic application forms with AI-assisted completion and automated data lookup
          </p>
        </div>
        <div className="mt-10 flex gap-6 md:mt-0">
          {/* <Button label={'Help'} variant="secondary" /> */}
          <Button
            label={"Create Form"}
            onClick={() => {
              setCreateFormModal(true);
              setFile(null);
            }}
            className="truncate text-sm! md:text-base!"
            data-testid="forms-create-btn"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 grid w-full grid-cols-1 items-end gap-2 xl:grid-cols-2">
        {/* Search Input with Toggle */}

        <div className="w-full rounded-lg">
          <TextField
            label={"Advance search"}
            type="text"
            className="bg-backgroundColor border-none text-sm outline-none"
            placeholder={searchMode === "client" ? "Search From" : "Search Name"}
            value={searchMode === "client" ? clientQuery : nameQuery}
            onChange={(e) => (searchMode === "client" ? setClientQuery(e.target.value) : setNameQuery(e.target.value))}
            leftIcon={<CiSearch />}
            rightIcon={
              <div className="flex gap-x-2">
                <Button
                  className={`border-none! ${searchMode === "client" ? "bg-primary! text-white!" : "bg-gray-200! text-gray-600!"}`}
                  onClick={() => setSearchMode("client")}
                  label={"BY CLIENT#"}
                />

                <Button
                  className={`border-none! ${searchMode === "name" ? "bg-primary! text-white!" : "bg-gray-200! text-gray-600!"}`}
                  onClick={() => setSearchMode("name")}
                  label={"BY NAME#"}
                />
              </div>
            }
          />
        </div>
        {/* Date Pickers */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="col-span-6 md:col-span-5 xl:col-span-5">
            <TextField label={"From"} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-4">
            <TextField label={"To"} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {/* Search Button */}
          <div className="col-span-6 flex items-end justify-end md:col-span-3 xl:col-span-3">
            <Button icon={CiSearch} label={"Search"} className="mt-0 h-12.5! md:mt-8 md:w-full!" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {forms?.data?.length > 0 ? (
          forms?.data?.map((form, index) => {
            const colors = form?.branding?.colors;
            const formButtonEffect = form?.branding?.buttonEffect || "none";
            const formButtonMaterial = form?.branding?.buttonMaterial ?? 0;
            const formButtonAngle = parseEffectState(formButtonEffect).angle;
            const formButtonGloss = materialToGloss(formButtonMaterial, formButtonAngle);
            const formButtonShadow = effectToBoxShadow(formButtonEffect) || "none";
            const formButtonBg = formButtonGloss
              ? `${formButtonGloss}, ${colors?.primary || "#066969"}`
              : colors?.primary || undefined;

            return (
              <div
                key={index}
                className="relative flex min-w-0 flex-col rounded-xl border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6"
              >
                <div className="flex justify-between">
                  <div
                    className="flex h-25 max-h-25 w-62.5 max-w-62.5 items-center justify-center rounded-lg px-3"
                    style={{ background: form?.branding?.colors?.headerBackground || "#f3f4f6" }}
                  >
                    <img
                      src={form?.branding?.selectedLogo || logo}
                      alt="logo"
                      className="h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="">
                    <div className="relative">
                      <button
                        ref={menuButtonRef}
                        onClick={actionMenu === form?._id ? () => setActionMenu(null) : () => setActionMenu(form?._id)}
                        className="cursor-pointer rounded p-1 hover:bg-gray-100"
                        aria-label="Actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {actionMenu === form?._id && (
                        <div ref={buttonRef} className="absolute right-0 mt-2 w-40 rounded border bg-white shadow-lg">
                          <button
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedId(form?._id);
                              setSelectedForm(form);
                              setOpenFormUpdate(true);
                            }}
                          >
                            Update Form
                          </button>
                          <button
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedId(form?._id);
                              setOpenModal(true);
                            }}
                          >
                            Set Branding
                          </button>
                          <button
                            onClick={() => {
                              setLocationModal(actionMenu);
                              setFormLocationData({
                                title: form?.locationTitle,
                                subtitle: form?.locationSubtitle,
                                status: form?.locationStatus,
                                message: form?.locationMessage,
                                formatedText: form?.formatedLocationMessage,
                                formatingTextInstructions: form?.formateTextInstructions,
                              });
                            }}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                          >
                            Set Location
                          </button>
                          <button
                            onClick={() => navigate(`/manage-rules/${form?._id}`)}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                          >
                            Manage Rules
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation(form?._id)}
                            className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 cursor-pointer"
                          >
                            Delete Form
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu icon */}
                <div className="absolute top-3 right-3 cursor-pointer sm:top-4 sm:right-4">{/* <CiMenuKebab /> */}</div>
                <div className="flex items-start gap-2 md:gap-4">
                  {/* <CardIcon /> */}
                  <div className="mt-4 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base leading-tight font-bold wrap-break-word text-gray-700 sm:text-lg md:text-2xl">
                        {form?.headerText || form?.name}
                      </h2>
                    </div>
                    {/* <div className="mt-1 truncate text-xs text-gray-500 sm:text-sm">Created from CSV import</div> */}
                  </div>
                </div>
                {/* <div className="mt-3 space-y-1 text-sm text-gray-700 md:mt-3 md:text-base">
        <div className="flex items-center gap-1 md:gap-2">
          <FaCheck className="text-primary" />
          <span>{form?.sections?.length} form sections</span>
        </div>{' '}
        <div className="flex items-center gap-1 md:gap-2">
          <FaCheck className="text-primary" />
          <span>AI-assisted completion available</span>
        </div>
      </div> */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  {/* <span className="text-gray-500">Applicants: {form?.sections?.length}</span> */}
                  <span className="text-gray-500">
                    Created:{" "}
                    {new Date(form?.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="mt-3 flex h-full w-full flex-col items-start justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
                  <Button
                    label="Start Application"
                    onClick={() => navigate(`/application-form/${form?.branding?.name}/${form?._id}`)}
                    className="self-end"
                    style={{
                      background: formButtonBg,
                      borderColor: colors?.primary,
                      color: colors?.buttonTextPrimary,
                      boxShadow: formButtonShadow,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <CustomLoading />
        )}
      </div>
    </div>
  );
}

export const FormConfigurationModal = ({ form, refetch, setModal }) => {
  const [redirectUrl, setRedirectUrl] = useState(form?.redirectUrl || "");
  const [headerText, setHeaderText] = useState(form?.headerText || "");
  const [headerTextSize, setHeaderTextSize] = useState(form?.headerTextSize || 24);
  const [updateForm, { isLoading: isUpdatingForm }] = useUpdateFormMutation();

  const handleFormLocationUpdate = async () => {
    try {
      const res = await updateForm({ _id: form?._id, data: { redirectUrl, headerText, headerTextSize } }).unwrap();
      if (res?.success) {
        await refetch();
        toast?.success(res?.message || "Form updated successfully");
        setModal(false);
      }
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error(error?.data?.message || "Failed to update form");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Heading */}
        <h3 className="text-center text-lg font-semibold text-gray-800">Form Configuration</h3>

        {/* Form url */}

        <div className="flex items-center gap-2">
          <TextField
            label="Form URL"
            id="redirect-url"
            value={`${window.location.origin}/application-form/${form?.branding?.name}/${form?._id}`}
            readOnly
            onChange={() => {}}
            name="redirect-url"
          />
          <Button
            label={"Copy"}
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/application-form/${form?.branding?.name}/${form?._id}`,
              );
              toast.success("Copied to clipboard");
            }}
            className=" self-end! h-12!"
            rightIcon={CopyIcon}
            cnRight={"h-5! w-5!"}
          />
        </div>

        {/* Message Textarea */}
        <div className="flex flex-col gap-2">
          <TextField
            label="Redirect URL"
            id="redirect-url"
            placeholder="Enter redirect URL"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            name="redirect-url"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <TextField
                label="Header Text"
                id="header-text"
                placeholder="Enter header text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                name="header-text"
                style={{ fontSize: `${headerTextSize}px` }}
              />
            </div>
            <div className="flex flex-col gap-1 pb-1">
              <TextField
                type="number"
                min={8}
                label={"Size (px)"}
                max={72}
                value={headerTextSize}
                onChange={(e) => setHeaderTextSize(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Format Text Label and Button */}

        {/* Action Buttons */}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal(false)} />
          <Button disabled={isUpdatingForm} label="Save" variant="primary" onClick={handleFormLocationUpdate} />
        </div>
      </div>
    </div>
  );
};
