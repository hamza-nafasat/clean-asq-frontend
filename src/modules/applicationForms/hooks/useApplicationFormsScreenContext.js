import { useEffect, useRef, useState } from "react";
import { useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import { useGetAllEmailTemplatesQuery } from "@/redux/apis/email.apis";
import {
  useGetAllFormRulesQuery,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useGetSingleFormQueryQuery,
  useLazyGetSingleFormQueryQuery,
} from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import useApplicationFormsAssistantActions from "./useApplicationFormsAssistantActions";
import { APPLICATION_FORMS_SCREEN } from "../utils/applicationForms.constants";
import { buildFormsAssistantState } from "../utils/applicationForms.assistant.utils";
import { applyPendingEdits, createEmptyPendingEdits } from "../utils/applicationForms.pendingEdits.utils";
import { toFormPreview } from "../utils/applicationForms.preview.utils";

const SERVER_URL = getEnv("SERVER_URL");

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
  const [fetchSingleForm] = useLazyGetSingleFormQueryQuery();
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

  // preview built from data, not written by the model
  const previewForm = async ({ formId }) => {
    const res = await fetchSingleForm({ _id: formId }, true).unwrap();
    const edits = pendingFormEditsRef.current?.formId === formId ? pendingFormEditsRef.current : null;
    return toFormPreview(applyPendingEdits(res.data, edits));
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
    actions: { ...actions, previewForm },
  });
};

export default useApplicationFormsScreenContext;
