import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { useGetSavedFormMutation } from "@/redux/apis/form.apis";
import { addSavedFormData, setCurrentDraftId } from "@/redux/slices/form.slice";
import { formKeys } from "@/constants";
import { DRAFT_NOT_FOUND_MESSAGE, SECTION_KEYS } from "../utils/applicant.constants";
import { buildIdMissionDataFromDraft } from "../utils/applicant.idMission.utils";

// restore the ID Mission step from the saved draft
const useApplicantIdMissionDraft = ({
  formId,
  draftId,
  email,
  idMissionScanAppliedRef,
  setIdMissionVerifiedData,
  showIdMissionDetails,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { emailVerified, formData } = useSelector((state) => state.form);
  const [getSavedFormData] = useGetSavedFormMutation();

  const loadDraft = useCallback(async () => {
    const prefillEmailOnly = () => {
      if (idMissionScanAppliedRef.current) return;
      setIdMissionVerifiedData((prev) => ({
        ...prev,
        email: { name: "email", value: prev.email?.value || email || user?.email || "" },
      }));
    };

    // a fresh start has no draft yet, company lookup creates it
    if (!draftId) return prefillEmailOnly();
    try {
      const res = await getSavedFormData({ formId, draftId }).unwrap();
      if (!res.success) return;
      const savedData = res.data?.savedData || {};
      const savedIdMission = savedData[SECTION_KEYS.ID_MISSION];
      unwrapResult(await dispatch(addSavedFormData(savedData)));
      if (res.data?._id) dispatch(setCurrentDraftId(res.data._id));
      // keep fields already filled by an IDMission scan
      if (!idMissionScanAppliedRef.current) {
        const draftEmail = email || savedIdMission?.email?.value || user?.email || "";
        setIdMissionVerifiedData(buildIdMissionDataFromDraft(savedIdMission, draftEmail, { includeAddress2: true }));
      }
      if (savedIdMission?.name?.value && savedData[formKeys.company_lookup_data]) showIdMissionDetails();
    } catch (error) {
      if (error?.data?.message === DRAFT_NOT_FOUND_MESSAGE) return prefillEmailOnly();
      console.error("Get saved form error:", error);
    }
  }, [
    dispatch,
    draftId,
    email,
    formId,
    getSavedFormData,
    idMissionScanAppliedRef,
    setIdMissionVerifiedData,
    showIdMissionDetails,
    user?.email,
  ]);

  // only jump to details when the draft has identity data
  const restoreDraftIdentity = useCallback(() => {
    const savedIdMission = formData?.[SECTION_KEYS.ID_MISSION];
    const draftHasIdentity = !!(savedIdMission?.name?.value || savedIdMission?.idNumber?.value);
    if (!emailVerified || !draftHasIdentity || idMissionScanAppliedRef.current) return;
    setIdMissionVerifiedData(
      buildIdMissionDataFromDraft(savedIdMission, savedIdMission?.email?.value || user?.email || ""),
    );
    showIdMissionDetails();
  }, [emailVerified, formData, idMissionScanAppliedRef, setIdMissionVerifiedData, showIdMissionDetails, user?.email]);

  return { loadDraft, restoreDraftIdentity };
};

export default useApplicantIdMissionDraft;
