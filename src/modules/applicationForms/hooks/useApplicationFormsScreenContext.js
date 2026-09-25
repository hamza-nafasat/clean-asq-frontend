import { useEffect, useRef, useState } from "react";
import { useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import { useGetAllEmailTemplatesQuery } from "@/redux/apis/email.apis";
import {
  useGetAllFormRulesQuery,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useGetSingleFormQueryQuery,
} from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import useApplicationFormsAssistantActions from "./useApplicationFormsAssistantActions";
import { APPLICATION_FORMS_SCREEN } from "../utils/applicationForms.constants";
import { buildFormsAssistantState } from "../utils/applicationForms.assistant.utils";
import { countDeletedFields, createEmptyPendingEdits } from "../utils/applicationForms.pendingEdits.utils";

const SERVER_URL = getEnv("SERVER_URL");

const countKeys = (value) => Object.keys(value || {}).length;

// values that re-register the screen
const buildScreenContextDeps = ({ forms, brandings, emailTemplates, searchStrategies, formStrategies, ...rest }) =>
  JSON.stringify({
    formsCount: forms?.length ?? 0,
    brandingsCount: brandings?.length ?? 0,
    selectedFormId: rest.selectedFormId ?? "",
    detailedFormId: rest.singleForm?._id ?? "",
    detailedFormSectionCount: rest.singleForm?.sections?.length ?? 0,
    singleFormLoadError: Boolean(rest.singleFormError),
    formRulesCount: rest.formRules?.length ?? 0,
    searchStrategiesCount: searchStrategies?.length ?? 0,
    formStrategiesCount: formStrategies?.length ?? 0,
    emailTemplateFormLinkCount: (emailTemplates || []).reduce((sum, t) => sum + (t.forms || []).length, 0),
    pendingEditsFormId: rest.pendingFormEdits?.formId ?? "",
    pendingSectionUpdateCount: countKeys(rest.pendingFormEdits?.sectionUpdates),
    pendingFieldUpdateCount: countKeys(rest.pendingFormEdits?.fieldUpdates),
    pendingHasSectionOrder: Boolean(rest.pendingFormEdits?.sectionOrder),
    pendingDeletedSectionCount: rest.pendingFormEdits?.deletedSections?.length ?? 0,
    pendingDeletedFieldCount: countDeletedFields(rest.pendingFormEdits),
  });

const useApplicationFormsScreenContext = ({ onOpenCreateForm, askConfirm }) => {
  const [selectedFormForEditing, setSelectedFormForEditing] = useState(null);
  const [pendingFormEdits, setPendingFormEdits] = useState(null);
  // latest data for action closures
  const pendingFormEditsRef = useRef(null);
  const latestDataRef = useRef({});

  const canReadBranding = usePermission(PERMISSIONS.READ_BRANDING);
  const canReadEmail = usePermission(PERMISSIONS.READ_EMAIL);
  const canReadLookup = usePermission(PERMISSIONS.READ_LOOKUP);
  const canReadStrategy = usePermission(PERMISSIONS.READ_STRATEGY);
  const canReadRule = usePermission(PERMISSIONS.READ_RULE);

  const { data: forms, refetch } = useGetMyAllFormsQuery();
  const { data: brandings } = useGetAllBrandingsQuery(undefined, { skip: !canReadBranding });
  const { data: allEmailTemplates, refetch: refetchEmailTemplates } = useGetAllEmailTemplatesQuery(undefined, {
    skip: !canReadEmail,
  });
  const { data: searchStrategies } = useGetAllSearchStrategiesQuery(undefined, { skip: !canReadLookup });
  const { data: formStrategies, refetch: refetchFormStrategies } = useGetAllFormStrategiesQuery(undefined, {
    skip: !canReadStrategy,
  });
  const { data: singleFormData, isError: singleFormError } = useGetSingleFormQueryQuery(
    { _id: selectedFormForEditing },
    { skip: !selectedFormForEditing, refetchOnMountOrArgChange: true },
  );
  const { data: formRulesData } = useGetAllFormRulesQuery(
    { formId: selectedFormForEditing },
    { skip: !selectedFormForEditing || !canReadRule, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    latestDataRef.current = {
      forms: forms?.data,
      emailTemplates: allEmailTemplates?.data,
      singleForm: singleFormData?.data,
    };
  }, [forms, allEmailTemplates, singleFormData]);

  // clear selection to refetch the form
  const reloadSelectedForm = (formId) => {
    setSelectedFormForEditing(null);
    setTimeout(() => setSelectedFormForEditing(formId), 0);
  };

  const pending = {
    ref: pendingFormEditsRef,
    set: (next) => {
      pendingFormEditsRef.current = next;
      setPendingFormEdits(next);
    },
    getBase: () => pendingFormEditsRef.current || createEmptyPendingEdits(selectedFormForEditing),
  };

  const actions = useApplicationFormsAssistantActions({
    latestDataRef,
    pending,
    refetch,
    refetchEmailTemplates,
    refetchFormStrategies,
    reloadSelectedForm,
    selectedFormId: selectedFormForEditing,
    onOpenCreateForm,
    askConfirm,
  });

  const screenData = {
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
  };

  useScreenContext({
    screenId: APPLICATION_FORMS_SCREEN.ID,
    screenName: APPLICATION_FORMS_SCREEN.NAME,
    assistantName: APPLICATION_FORMS_SCREEN.ASSISTANT_NAME,
    aiEndpoint: `${SERVER_URL}${APPLICATION_FORMS_SCREEN.AI_ENDPOINT_PATH}`,
    greeting: APPLICATION_FORMS_SCREEN.GREETING,
    currentState: buildFormsAssistantState(screenData),
    actions,
    deps: buildScreenContextDeps(screenData),
  });
};

export default useApplicationFormsScreenContext;
