import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { useSaveFormInDraftMutation } from "@/redux/apis/form.apis";
import { setCurrentDraftId, updateEmailVerified, updateFormState } from "@/redux/slices/form.slice";
import { SECTION_KEYS } from "../utils/applicant.constants";
import { collectClientDetails } from "../utils/applicant.clientDetails.utils";
import { buildUpdatedBy } from "../utils/applicant.draft.utils";
import { buildStepperPath } from "@/utils/applicationPaths";

// save the ID Mission details and continue to the stepper
const useApplicantIdMissionSubmit = ({ formId, draftId, idMissionVerifiedData, setIsSubmitting }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state.form);
  const [saveFormInDraft] = useSaveFormInDraftMutation();

  return useCallback(
    async (e) => {
      e?.preventDefault();
      const signature = idMissionVerifiedData?.signature?.value;
      if (!signature?.publicId && !signature?.secureUrl)
        return toast.error("You must save your signature before taking the next step.");
      setIsSubmitting(true);
      try {
        const idMissionData = { ...idMissionVerifiedData, updatedBy: buildUpdatedBy(user) };
        unwrapResult(await dispatch(updateFormState({ data: idMissionVerifiedData, name: SECTION_KEYS.ID_MISSION })));
        const { data: clientDetails } = await collectClientDetails();
        const res = await saveFormInDraft({
          formId,
          draftId,
          formData: {
            ...formData,
            [SECTION_KEYS.ID_MISSION]: idMissionData,
            [SECTION_KEYS.METADATA]: {
              ...clientDetails,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              updatedBy: buildUpdatedBy(user),
            },
          },
        }).unwrap();
        toast.success(res.message);
        // a draft created just now carries its id into the stepper
        const effectiveDraftId = draftId || res.data?.draftId;
        if (effectiveDraftId) dispatch(setCurrentDraftId(effectiveDraftId));
        dispatch(updateEmailVerified(false));
        navigate(buildStepperPath({ formId, draftId: effectiveDraftId }));
      } catch (error) {
        // stay here so the details are not lost
        console.error("Submit ID Mission error:", error);
        toast.error(error?.data?.message || "Error while saving form in draft");
        setIsSubmitting(false);
      }
    },
    [dispatch, draftId, formData, formId, idMissionVerifiedData, navigate, saveFormInDraft, setIsSubmitting, user],
  );
};

export default useApplicantIdMissionSubmit;
