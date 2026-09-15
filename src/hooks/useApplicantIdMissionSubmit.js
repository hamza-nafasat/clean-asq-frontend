import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { useSaveFormInDraftMutation } from "@/redux/apis/form.apis";
import { setCurrentDraftId, updateEmailVerified, updateFormState } from "@/redux/slices/form.slice";
import { SECTION_KEYS } from "@/modules/applicant/utils/applicant.constants";
import { collectClientDetails } from "@/modules/applicant/utils/applicant.utils";
import { buildStepperPath } from "@/modules/applicant/utils/applicant.utils6";
import { buildUpdatedBy } from "@/modules/applicant/utils/applicant.utils8";

// save the ID Mission details and continue to the stepper
const useApplicantIdMissionSubmit = ({ formId, draftId, idMissionVerifiedData, setSubmiting }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state.form);
  const [saveFormInDraft] = useSaveFormInDraftMutation();

  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        if (!formId) return toast.error("From id not provided");
        const { data: userDetailsData } = await collectClientDetails();
        const formDataInRedux = {
          ...formData,
          [name]: data,
          [SECTION_KEYS.METADATA]: {
            ...userDetailsData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: buildUpdatedBy(user),
          },
        };
        const res = await saveFormInDraft({ formId, draftId, formData: { ...formDataInRedux } }).unwrap();
        if (res.success) {
          if (res?.data?.draftId) dispatch(setCurrentDraftId(res.data.draftId));
          toast.success(res.message);
        }
        return res;
      } catch (error) {
        console.error("Save draft error:", error);
        toast.error(error?.data?.message || "Error while saving form in draft");
      }
    },
    [dispatch, draftId, formData, formId, saveFormInDraft, user],
  );

  const submitIdMissionData = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmiting(true);
      try {
        if (!idMissionVerifiedData?.signature?.value?.publicId && !idMissionVerifiedData?.signature?.value?.secureUrl) {
          setSubmiting(false);
          return toast.error("You must save your signature before taking the next step.");
        }
        unwrapResult(await dispatch(updateFormState({ data: idMissionVerifiedData, name: SECTION_KEYS.ID_MISSION })));
        const saveRes = await saveInProgress({
          data: { ...idMissionVerifiedData, updatedBy: buildUpdatedBy(user) },
          name: SECTION_KEYS.ID_MISSION,
        });
        // a draft created just now carries its id into the stepper
        const effectiveDraftId = draftId || saveRes?.data?.draftId;
        if (effectiveDraftId) dispatch(setCurrentDraftId(effectiveDraftId));
        dispatch(updateEmailVerified(false));
        return navigate(buildStepperPath(formId, effectiveDraftId));
      } catch (error) {
        console.error("Submit ID Mission error:", error);
        setSubmiting(false);
      }
    },
    [dispatch, draftId, formId, idMissionVerifiedData, navigate, saveInProgress, setSubmiting, user],
  );

  return submitIdMissionData;
};

export default useApplicantIdMissionSubmit;
