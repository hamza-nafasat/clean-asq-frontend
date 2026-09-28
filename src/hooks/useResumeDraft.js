import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { useGetSavedFormMutation } from "@/redux/apis/form.apis";
import { addSavedFormData, setCurrentDraftId, updateEmailVerified } from "@/redux/slices/form.slice";
import { LAYOUT_ROUTES, VERIFICATION_PARAMS } from "@/constants";

const buildVerificationPath = ({ formId, draftId, brandingName }) => {
  const params = new URLSearchParams({ [VERIFICATION_PARAMS.FORM_ID]: formId });
  if (brandingName) params.set(VERIFICATION_PARAMS.BRANDING_NAME, brandingName);
  if (draftId) params.set(VERIFICATION_PARAMS.DRAFT_ID, draftId);
  return `${LAYOUT_ROUTES.VERIFICATION}?${params}`;
};

const buildApplicationFormPath = ({ formId, draftId, brandingName }) => {
  const query = draftId ? `?${new URLSearchParams({ [VERIFICATION_PARAMS.DRAFT_ID]: draftId })}` : "";
  return `${LAYOUT_ROUTES.APPLICATION_FORM}/${encodeURIComponent(brandingName)}/${formId}${query}`;
};

// reopen a draft where it was left
const useResumeDraft = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [getSavedForm] = useGetSavedFormMutation();

  return useCallback(
    async ({ formId, draftId, brandingName }) => {
      const draft = { formId, draftId, brandingName };
      try {
        dispatch(updateEmailVerified(true));
        if (draftId) dispatch(setCurrentDraftId(draftId));
        const res = await getSavedForm({ formId, draftId }).unwrap();
        const savedData = res.data?.savedData ?? {};
        unwrapResult(await dispatch(addSavedFormData(savedData)));
        // company lookup still to do
        if (!savedData.company_lookup_data) return navigate(buildVerificationPath(draft));
        return navigate(buildApplicationFormPath(draft));
      } catch (error) {
        console.error("Resume draft error:", error);
        return navigate(buildVerificationPath(draft));
      }
    },
    [dispatch, navigate, getSavedForm],
  );
};

export default useResumeDraft;
