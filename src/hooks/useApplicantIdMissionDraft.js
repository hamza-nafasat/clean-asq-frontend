import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { useGetSavedFormMutation } from "@/redux/apis/form.apis";
import { addSavedFormData, setCurrentDraftId } from "@/redux/slices/form.slice";
import { DRAFT_NOT_FOUND_MESSAGE } from "@/modules/applicant/utils/applicant.constants";
import { buildIdMissionDataFromDraft } from "@/modules/applicant/utils/applicant.utils5";
import { buildVerificationPath } from "@/modules/applicant/utils/applicant.utils6";

// restore the ID Mission step from the saved draft
const useApplicantIdMissionDraft = ({
  formId,
  draftId,
  email,
  brandingName,
  qrCode,
  webLink,
  idMissionScanAppliedRef,
  navigatingAwayRef,
  setIdMissionVerifiedData,
  setIdMissionVerified,
  setIdMissionDetailsReady,
  setQrLoading,
  setQrFetchError,
  getQrAndWebLink,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { emailVerified, formData } = useSelector((state) => state.form);
  const [getSavedFormData] = useGetSavedFormMutation();

  const getSavedFormDataAndSaveInRedux = useCallback(
    async ({ skipRedirectOnError = false } = {}) => {
      const prefillEmailOnly = () => {
        if (idMissionScanAppliedRef.current) return;
        setIdMissionVerifiedData((prev) => ({
          ...prev,
          email: { name: "email", value: prev.email?.value || email || user?.email || "" },
        }));
      };
      const goToVerification = () => {
        navigatingAwayRef.current = true;
        return navigate(buildVerificationPath(formId, brandingName, draftId));
      };

      // a fresh start has no draft yet, company lookup creates it
      if (!draftId) {
        if (skipRedirectOnError) {
          prefillEmailOnly();
          return;
        }
        return goToVerification();
      }
      try {
        const res = await getSavedFormData({ formId, draftId }).unwrap();
        if (!res.success) return;
        const savedData = res?.data?.savedData || [];
        const savedIdMission = savedData?.idMission;
        unwrapResult(await dispatch(addSavedFormData(savedData || [])));
        if (res?.data?._id) dispatch(setCurrentDraftId(res.data._id));
        // keep fields already filled by an IDMission scan
        if (!idMissionScanAppliedRef.current) {
          const draftEmail = email || savedIdMission?.email?.value || user?.email || "";
          setIdMissionVerifiedData(buildIdMissionDataFromDraft(savedIdMission, draftEmail, { includeAddress2: true }));
        }
        if (savedIdMission?.name?.value && savedData?.company_lookup_data) {
          setIdMissionVerified(true);
          setIdMissionDetailsReady(true);
        } else if (!skipRedirectOnError && !savedData?.company_lookup_data) {
          return goToVerification();
        } else {
          getQrAndWebLink();
        }
      } catch (error) {
        if (error?.data?.message === DRAFT_NOT_FOUND_MESSAGE) {
          if (skipRedirectOnError) {
            prefillEmailOnly();
            return;
          }
          return goToVerification();
        }
        console.error("Get saved form error:", error);
      }
    },
    [
      brandingName,
      dispatch,
      draftId,
      email,
      formId,
      getQrAndWebLink,
      getSavedFormData,
      idMissionScanAppliedRef,
      navigate,
      navigatingAwayRef,
      setIdMissionDetailsReady,
      setIdMissionVerified,
      setIdMissionVerifiedData,
      user?.email,
    ],
  );

  const getQrLinkOnEmailVerified = useCallback(() => {
    // only jump to details when the draft has identity data
    const savedIdMission = formData?.idMission;
    const draftHasIdentity = !!(savedIdMission?.name?.value || savedIdMission?.idNumber?.value);
    if (emailVerified && draftHasIdentity && !idMissionScanAppliedRef.current) {
      setIdMissionVerifiedData(
        buildIdMissionDataFromDraft(savedIdMission, savedIdMission?.email?.value || user?.email || ""),
      );
      setIdMissionVerified(true);
      setIdMissionDetailsReady(true);
    }
    if (!qrCode && !webLink) {
      setQrLoading(true);
      getQrAndWebLink()
        .then(() => setQrLoading(false))
        .catch(() => setQrFetchError(true))
        .finally(() => setQrLoading(false));
    }
  }, [
    emailVerified,
    formData,
    getQrAndWebLink,
    idMissionScanAppliedRef,
    qrCode,
    setIdMissionDetailsReady,
    setIdMissionVerified,
    setIdMissionVerifiedData,
    setQrFetchError,
    setQrLoading,
    user?.email,
    webLink,
  ]);

  return { getSavedFormDataAndSaveInRedux, getQrLinkOnEmailVerified };
};

export default useApplicantIdMissionDraft;
