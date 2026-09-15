import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAddBrandingInFormMutation, useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import { useAttachTemplateToFormMutation, useGetAllEmailTemplatesQuery } from "@/redux/apis/email.apis";
import {
  useAddFormSectionMutation,
  useCloneFormMutation,
  useCloneFormRulesMutation,
  useDeleteFormSectionMutation,
  useDeleteSingleFormMutation,
  useFormateTextInMarkDownMutation,
  useGetAllFormRulesQuery,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useGetSingleFormQueryQuery,
  useReorderFormSectionsMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useUpdateFormMutation,
  useUpdateFormSectionMutation,
} from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/utils/env";
import { executeBrandingAssignments, getBrandingSettersFromHook } from "@/utils/executeBrandingAssignment";
import { APPLICATION_FORMS_SCREEN } from "@/modules/applicationForms/utils/applicationForms.constants";
import { buildFormsAssistantState } from "@/modules/applicationForms/utils/applicationForms.utils";
import {
  createEmptyPendingEdits,
  createUserRefreshDispatcher,
  markSectionDeleted,
  mergeFieldUpdates,
  mergeSectionUpdates,
} from "@/modules/applicationForms/utils/applicationForms.utils2";
import {
  collectFailures,
  commitPendingFormEdits,
  updateTemplateForms,
} from "@/modules/applicationForms/utils/applicationForms.utils3";

const SERVER_URL = getEnv("SERVER_URL");

const useApplicationFormsScreenContext = ({ onOpenCreateForm }) => {
  const dispatch = useDispatch();
  const brandingSetters = getBrandingSettersFromHook(useBranding());
  const [selectedFormForEditing, setSelectedFormForEditing] = useState(null);
  const [pendingFormEdits, setPendingFormEdits] = useState(null);
  // latest pending edits for action closures
  const pendingFormEditsRef = useRef(null);
  const singleFormDataRef = useRef(null);

  const { data: forms, refetch } = useGetMyAllFormsQuery();
  const { data: brandings } = useGetAllBrandingsQuery();
  const { data: allEmailTemplates, refetch: refetchEmailTemplates } = useGetAllEmailTemplatesQuery();
  const { data: searchStrategies } = useGetAllSearchStrategiesQuery();
  const { data: formStrategies, refetch: refetchFormStrategies } = useGetAllFormStrategiesQuery();
  const { data: singleFormData, isError: singleFormError } = useGetSingleFormQueryQuery(
    { _id: selectedFormForEditing },
    { skip: !selectedFormForEditing, refetchOnMountOrArgChange: true },
  );
  const { data: formRulesData } = useGetAllFormRulesQuery(
    { formId: selectedFormForEditing },
    { skip: !selectedFormForEditing, refetchOnMountOrArgChange: true },
  );
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [addFromBranding] = useAddBrandingInFormMutation();
  const [attachEmailTemplateMutation] = useAttachTemplateToFormMutation();
  const [deleteForm] = useDeleteSingleFormMutation();
  const [updateForm] = useUpdateFormMutation();
  const [cloneFormMutation] = useCloneFormMutation();
  const [cloneFormRulesMutation] = useCloneFormRulesMutation();
  const [updateFormSection] = useUpdateFormSectionMutation();
  const [formateTextInMarkDown] = useFormateTextInMarkDownMutation();
  const [addFormSectionMutation] = useAddFormSectionMutation();
  const [updateDeleteCreateFormFields] = useUpdateDeleteCreateFormFieldsMutation();
  const [reorderFormSectionsMutation] = useReorderFormSectionsMutation();
  const [deleteFormSectionMutation] = useDeleteFormSectionMutation();

  useEffect(() => {
    singleFormDataRef.current = singleFormData;
  }, [singleFormData]);

  const formsCount = forms?.data?.length ?? 0;
  const brandingsCount = brandings?.data?.length ?? 0;
  const selectedFormId = selectedFormForEditing ?? "";
  const detailedFormId = singleFormData?.data?._id ?? "";
  const detailedFormSectionCount = singleFormData?.data?.sections?.length ?? 0;
  const singleFormLoadError = !!singleFormError;
  const formRulesCount = (formRulesData?.data || []).length;
  const searchStrategiesCount = searchStrategies?.data?.length ?? 0;
  const formStrategiesCount = formStrategies?.data?.length ?? 0;
  const emailTemplateFormLinkCount = (allEmailTemplates?.data || []).reduce(
    (sum, t) => sum + (t.forms || []).length,
    0,
  );
  const pendingEditsFormId = pendingFormEdits?.formId ?? "";
  const pendingSectionUpdateCount = Object.keys(pendingFormEdits?.sectionUpdates || {}).length;
  const pendingFieldUpdateCount = Object.keys(pendingFormEdits?.fieldUpdates || {}).length;
  const pendingHasSectionOrder = !!pendingFormEdits?.sectionOrder;
  const pendingDeletedSectionCount = pendingFormEdits?.deletedSections?.length ?? 0;

  const screenContextDeps = useMemo(
    () => ({
      formsCount,
      brandingsCount,
      selectedFormId,
      detailedFormId,
      detailedFormSectionCount,
      singleFormLoadError,
      formRulesCount,
      searchStrategiesCount,
      formStrategiesCount,
      emailTemplateFormLinkCount,
      pendingEditsFormId,
      pendingSectionUpdateCount,
      pendingFieldUpdateCount,
      pendingHasSectionOrder,
      pendingDeletedSectionCount,
    }),
    [
      formsCount,
      brandingsCount,
      selectedFormId,
      detailedFormId,
      detailedFormSectionCount,
      singleFormLoadError,
      formRulesCount,
      searchStrategiesCount,
      formStrategiesCount,
      emailTemplateFormLinkCount,
      pendingEditsFormId,
      pendingSectionUpdateCount,
      pendingFieldUpdateCount,
      pendingHasSectionOrder,
      pendingDeletedSectionCount,
    ],
  );

  // briefly clear the selection so the form is fetched fresh
  const reloadSelectedForm = (formId) => {
    setSelectedFormForEditing(null);
    setTimeout(() => setSelectedFormForEditing(formId), 0);
  };

  const setPending = (next) => {
    pendingFormEditsRef.current = next;
    setPendingFormEdits(next);
  };

  const getPendingBase = () => pendingFormEditsRef.current || createEmptyPendingEdits(selectedFormForEditing);

  const updateFormsOrThrow = async (updates, buildData, verb) => {
    const failures = await collectFailures(updates, ({ formId, ...rest }) =>
      updateForm({ _id: formId, data: buildData(rest) }).unwrap(),
    );
    await refetch();
    if (failures.length) {
      toast.error(`Failed to update ${verb}${failures.length} of ${updates.length} forms`);
      throw new Error(`Failed to update ${verb}${failures.length} forms`);
    }
  };

  useScreenContext({
    screenId: APPLICATION_FORMS_SCREEN.ID,
    screenName: APPLICATION_FORMS_SCREEN.NAME,
    assistantName: APPLICATION_FORMS_SCREEN.ASSISTANT_NAME,
    aiEndpoint: `${SERVER_URL}${APPLICATION_FORMS_SCREEN.AI_ENDPOINT_PATH}`,
    greeting: APPLICATION_FORMS_SCREEN.GREETING,
    currentState: buildFormsAssistantState({
      forms: forms?.data,
      brandings: brandings?.data,
      emailTemplates: allEmailTemplates?.data,
      formStrategies: formStrategies?.data,
      searchStrategies: searchStrategies?.data,
      formRules: formRulesData?.data,
      singleForm: singleFormData?.data,
      singleFormError,
      selectedFormId: selectedFormForEditing,
      pendingFormEdits,
    }),
    actions: {
      selectFormForEditing: ({ formId }) => reloadSelectedForm(formId),
      updateSectionSettings: ({ updates }) => setPending(mergeSectionUpdates(getPendingBase(), updates)),
      updateFieldSettings: ({ updates }) => setPending(mergeFieldUpdates(getPendingBase(), updates)),
      reorderSections: ({ sectionOrder }) => setPending({ ...getPendingBase(), sectionOrder }),
      deleteSection: ({ sectionId }) => setPending(markSectionDeleted(getPendingBase(), sectionId)),
      discardFormEdits: () => setPending(null),
      addSection: async ({ formId, title, name, key, isHidden, position }) => {
        const res = await addFormSectionMutation({
          formId,
          title,
          name,
          key,
          isHidden,
          position,
        }).unwrap();
        if (!res?.success) throw new Error(res?.message);
        reloadSelectedForm(formId);
        return res.data;
      },
      addField: async ({ sectionId, label, type, required, placeholder, options }) => {
        const fieldData = { label, type, required: required || false };
        if (placeholder) fieldData.placeholder = placeholder;
        if (options?.length) fieldData.options = options;
        const res = await updateDeleteCreateFormFields({
          sectionId,
          fieldsData: [fieldData],
        }).unwrap();
        if (!res?.success) throw new Error(res?.message);
        reloadSelectedForm(selectedFormForEditing);
        return res;
      },
      saveFormEdits: async () => {
        const edits = pendingFormEditsRef.current;
        if (!edits) return { saved: false };
        const errors = await commitPendingFormEdits({
          edits,
          getSections: () => singleFormDataRef.current?.data?.sections,
          mutations: {
            deleteFormSection: deleteFormSectionMutation,
            reorderFormSections: reorderFormSectionsMutation,
            updateFormSection,
            formateTextInMarkDown,
            updateFormFields: updateDeleteCreateFormFields,
          },
        });
        setPending(null);
        await refetch();
        if (errors.length) throw new Error(`Saved with ${errors.length} error(s): ${errors.join("; ")}`);
        return { saved: true };
      },
      updateForms: ({ updates }) => updateFormsOrThrow(updates, (data) => data, ""),
      setFormsBranding: async ({ updates }) => {
        await executeBrandingAssignments({
          updates,
          addBrandingMutation: addFromBranding,
          getUserProfile,
          brandingSetters,
          dispatchUserRefresh: createUserRefreshDispatcher(dispatch),
        });
        await refetch();
      },
      setFormsLocation: ({ updates }) =>
        updateFormsOrThrow(updates, ({ locationStatus }) => ({ locationStatus }), "location on "),
      deleteForms: async ({ formIds }) => {
        const failures = await collectFailures(formIds, (formId) => deleteForm({ _id: formId }).unwrap());
        await refetch();
        if (failures.length) {
          toast.error(`Failed to delete ${failures.length} of ${formIds.length} forms`);
          throw new Error(`Failed to delete ${failures.length} forms`);
        }
      },
      cloneForm: async ({ sourceFormId, newName }) => {
        const res = await cloneFormMutation({
          sourceFormId,
          name: newName,
        }).unwrap();
        if (!res?.success) throw new Error(res?.message);
        await Promise.all([refetch(), refetchEmailTemplates(), refetchFormStrategies()]);
        return res.data;
      },
      cloneRules: async ({ sourceFormId, targetFormId }) => {
        const res = await cloneFormRulesMutation({
          sourceFormId,
          targetFormId,
        }).unwrap();
        if (!res?.success) throw new Error(res?.message);
        return res.data;
      },
      openCreateFormModal: () => onOpenCreateForm?.(),
      attachEmailTemplate: async ({ formId, templateIds }) => {
        const errors = await updateTemplateForms({
          templates: allEmailTemplates?.data,
          templateIds,
          formId,
          attach: true,
          attachTemplate: attachEmailTemplateMutation,
        });
        if (errors.length) throw new Error(`Failed to attach ${errors.length} template(s)`);
      },
      detachEmailTemplate: async ({ formId, templateIds }) => {
        const errors = await updateTemplateForms({
          templates: allEmailTemplates?.data,
          templateIds,
          formId,
          attach: false,
          attachTemplate: attachEmailTemplateMutation,
        });
        if (errors.length) throw new Error(`Failed to detach ${errors.length} template(s)`);
      },
    },
    deps: screenContextDeps,
  });
};

export default useApplicationFormsScreenContext;
