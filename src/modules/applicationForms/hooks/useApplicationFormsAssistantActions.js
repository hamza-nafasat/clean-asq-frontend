import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAddBrandingInFormMutation } from "@/redux/apis/branding.apis";
import { useAttachTemplateToFormMutation } from "@/redux/apis/email.apis";
import {
  useAddFormFieldMutation,
  useAddFormSectionMutation,
  useCloneFormMutation,
  useCloneFormRulesMutation,
  useDeleteFormSectionMutation,
  useDeleteSingleFormMutation,
  useFormateTextInMarkDownMutation,
  useLazyGetSingleFormQueryQuery,
  useReorderFormSectionsMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useUpdateFormLocationMutation,
  useUpdateFormMutation,
  useUpdateFormSectionMutation,
} from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";
import { executeBrandingAssignments, getBrandingSettersFromHook } from "@/utils/executeBrandingAssignment";
import { getBrandingTargetNames, getFormNames } from "../utils/applicationForms.assistant.utils";
import { createUserRefreshDispatcher } from "../utils/applicationForms.branding.utils";
import {
  buildFormDisplayTextData,
  buildLocationData,
  formatDisplayText,
} from "../utils/applicationForms.displayText.utils";
import {
  describePendingEdits,
  markFieldDeleted,
  markSectionDeleted,
  mergeFieldUpdates,
  mergeSectionUpdates,
} from "../utils/applicationForms.pendingEdits.utils";
import {
  collectFailures,
  commitPendingFormEdits,
  toStatusError,
  updateTemplateForms,
} from "../utils/applicationForms.save.utils";

// screen actions the assistant may call
const useApplicationFormsAssistantActions = ({
  latestDataRef,
  pending,
  refetch,
  refetchEmailTemplates,
  refetchFormStrategies,
  reloadSelectedForm,
  selectedFormId,
  onOpenCreateForm,
  askConfirm,
}) => {
  const dispatch = useDispatch();
  const brandingSetters = getBrandingSettersFromHook(useBranding());
  const canReadEmail = usePermission(PERMISSIONS.READ_EMAIL);
  const canReadStrategy = usePermission(PERMISSIONS.READ_STRATEGY);
  const canFormat = usePermission(PERMISSIONS.SUBMIT_FORM);

  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [addFromBranding] = useAddBrandingInFormMutation();
  const [attachEmailTemplateMutation] = useAttachTemplateToFormMutation();
  const [deleteForm] = useDeleteSingleFormMutation();
  const [updateForm] = useUpdateFormMutation();
  const [updateFormLocation] = useUpdateFormLocationMutation();
  const [cloneFormMutation] = useCloneFormMutation();
  const [cloneFormRulesMutation] = useCloneFormRulesMutation();
  const [updateFormSection] = useUpdateFormSectionMutation();
  const [formateTextInMarkDown] = useFormateTextInMarkDownMutation();
  const [addFormSectionMutation] = useAddFormSectionMutation();
  const [updateDeleteCreateFormFields] = useUpdateDeleteCreateFormFieldsMutation();
  const [addFormField] = useAddFormFieldMutation();
  const [reorderFormSectionsMutation] = useReorderFormSectionsMutation();
  const [deleteFormSectionMutation] = useDeleteFormSectionMutation();
  const [fetchSingleForm] = useLazyGetSingleFormQueryQuery();

  const getForms = () => latestDataRef.current.forms;
  const findForm = (formId) => getForms()?.find((form) => form._id === formId);
  const formatText = (text, instructions) => formatDisplayText(formateTextInMarkDown, text, instructions);

  // confirm before an ai change
  const confirmOrCancel = async (details) => {
    const isConfirmed = await askConfirm?.(details);
    if (!isConfirmed) throw Object.assign(new Error("The user cancelled this change"), { isCancelled: true });
  };

  const confirmFormsUpdate = (updates, action) =>
    confirmOrCancel({
      title: "Update Forms",
      message: `${action} on ${getFormNames(
        getForms(),
        updates.map((update) => update.formId),
      )}?`,
      confirmButtonText: "Update",
    });

  const updateEachForm = async (updates, request, verb) => {
    const failures = await collectFailures(updates, request);
    await refetch();
    if (failures.length) {
      toast.error(`Failed to update ${verb}${failures.length} of ${updates.length} forms`);
      throw toStatusError(`Failed to update ${verb}${failures.length} forms`, failures);
    }
  };

  const setTemplateForms = async ({ formId, templateIds, attach }) => {
    const verb = attach ? "attach" : "detach";
    await confirmOrCancel({
      title: attach ? "Attach Email Templates" : "Detach Email Templates",
      message: `${attach ? "Attach" : "Detach"} ${templateIds.length} email template(s) ${attach ? "to" : "from"} ${getFormNames(getForms(), [formId])}?`,
      confirmButtonText: attach ? "Attach" : "Detach",
    });
    const errors = await updateTemplateForms({
      templates: latestDataRef.current.emailTemplates,
      templateIds,
      formId,
      attach,
      attachTemplate: attachEmailTemplateMutation,
    });
    if (errors.length) throw toStatusError(`Failed to ${verb} ${errors.length} template(s)`, errors);
  };

  return {
    selectFormForEditing: ({ formId }) => {
      if (pending.ref.current?.formId !== formId) pending.set(null);
      reloadSelectedForm(formId);
    },
    updateSectionSettings: ({ updates }) => pending.set(mergeSectionUpdates(pending.getBase(), updates)),
    updateFieldSettings: ({ updates }) => pending.set(mergeFieldUpdates(pending.getBase(), updates)),
    reorderSections: ({ sectionOrder }) => pending.set({ ...pending.getBase(), sectionOrder }),
    deleteSection: ({ sectionId }) => pending.set(markSectionDeleted(pending.getBase(), sectionId)),
    deleteField: ({ sectionId, fieldId }) => pending.set(markFieldDeleted(pending.getBase(), sectionId, fieldId)),
    discardFormEdits: () => pending.set(null),
    addSection: async ({ formId, title, name, key, isHidden, position }) => {
      const res = await addFormSectionMutation({ formId, title, name, key, isHidden, position }).unwrap();
      if (!res?.success) throw new Error(res?.message);
      reloadSelectedForm(formId);
      return res.data;
    },
    addField: async ({ sectionId, label, type, required, placeholder, options }) => {
      const fieldData = { label, type, required: required || false };
      if (placeholder) fieldData.placeholder = placeholder;
      if (options?.length) fieldData.options = options;
      // adds one field, keeps the rest
      const res = await addFormField({ sectionId, fieldData }).unwrap();
      if (!res?.success) throw new Error(res?.message);
      reloadSelectedForm(selectedFormId);
      return res;
    },
    saveFormEdits: async () => {
      const edits = pending.ref.current;
      if (!edits) return { saved: false };
      await confirmOrCancel({
        title: "Save Form Changes",
        message: `Save these changes to ${getFormNames(getForms(), [edits.formId])}: ${describePendingEdits(edits)}?`,
        confirmButtonText: "Save",
      });
      // sections of the edited form
      const editedForm = await fetchSingleForm({ _id: edits.formId }).unwrap();
      const errors = await commitPendingFormEdits({
        edits,
        formatText: canFormat ? formatText : null,
        getSections: () => editedForm.data?.sections,
        mutations: {
          deleteFormSection: deleteFormSectionMutation,
          reorderFormSections: reorderFormSectionsMutation,
          updateFormSection,
          updateFormFields: updateDeleteCreateFormFields,
        },
      });
      pending.set(null);
      await refetch();
      if (errors.length) {
        const details = errors.map((error) => error.message).join("; ");
        throw toStatusError(`Saved with ${errors.length} error(s): ${details}`, errors);
      }
      return { saved: true };
    },
    updateForms: async ({ updates }) => {
      await confirmFormsUpdate(updates, "Update the settings");
      await updateEachForm(
        updates,
        async ({ formId, headerText, headerTextSize, redirectUrl, ...displayTexts }) => {
          // form display texts need their formatted html
          const displayTextData = await buildFormDisplayTextData(findForm(formId), displayTexts, formatText);
          const data = { headerText, headerTextSize, redirectUrl, ...displayTextData };
          return updateForm({ _id: formId, data }).unwrap();
        },
        "",
      );
    },
    setFormsBranding: async ({ updates }) => {
      await confirmOrCancel({
        title: "Update Branding",
        message: `Change the branding on ${getBrandingTargetNames(getForms(), updates)}?`,
        confirmButtonText: "Update",
      });
      await executeBrandingAssignments({
        updates,
        addBrandingMutation: addFromBranding,
        getUserProfile,
        brandingSetters,
        dispatchUserRefresh: createUserRefreshDispatcher(dispatch),
      });
      await refetch();
    },
    setFormsLocation: async ({ updates }) => {
      await confirmFormsUpdate(updates, "Change the location setting");
      await updateEachForm(
        updates,
        async (update) => {
          const data = await buildLocationData(findForm(update.formId), update, canFormat ? formatText : null);
          return updateFormLocation({ _id: update.formId, data }).unwrap();
        },
        "location on ",
      );
    },
    deleteForms: async ({ formIds }) => {
      await confirmOrCancel({
        title: "Delete Forms",
        message: `Delete ${getFormNames(getForms(), formIds)}? This cannot be undone.`,
        confirmButtonText: "Delete",
      });
      const failures = await collectFailures(formIds, (formId) => deleteForm({ _id: formId }).unwrap());
      await refetch();
      if (failures.length) {
        toast.error(`Failed to delete ${failures.length} of ${formIds.length} forms`);
        throw toStatusError(`Failed to delete ${failures.length} forms`, failures);
      }
    },
    cloneForm: async ({ sourceFormId, newName }) => {
      const res = await cloneFormMutation({ sourceFormId, name: newName }).unwrap();
      if (!res?.success) throw new Error(res?.message);
      await Promise.all([
        refetch(),
        canReadEmail && refetchEmailTemplates(),
        canReadStrategy && refetchFormStrategies(),
      ]);
      return res.data;
    },
    cloneRules: async ({ sourceFormId, targetFormId }) => {
      const res = await cloneFormRulesMutation({ sourceFormId, targetFormId }).unwrap();
      if (!res?.success) throw new Error(res?.message);
      return res.data;
    },
    openCreateFormModal: () => onOpenCreateForm?.(),
    attachEmailTemplate: ({ formId, templateIds }) => setTemplateForms({ formId, templateIds, attach: true }),
    detachEmailTemplate: ({ formId, templateIds }) => setTemplateForms({ formId, templateIds, attach: false }),
  };
};

export default useApplicationFormsAssistantActions;
