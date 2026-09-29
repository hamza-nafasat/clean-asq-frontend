import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSaveFormInDraftMutation, useSubmitFormMutation } from "@/redux/apis/form.apis";
import { resetApplicationProgress, setCurrentDraftId, updateFormState } from "@/redux/slices/form.slice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { uploadFilesAndReplace } from "@/lib/utils";
import { STEPPER_PARAMS } from "@/constants";
import { buildSubmissionSuccessPath } from "@/utils/applicationPaths";
import { buildUpdatedBy, resolveCreatedAt } from "../utils/applicant.draft.utils";

// next, previous, submit and save-progress handlers for the application stepper
const useApplicantStepSubmission = ({
  formDocumentId,
  draftId,
  formData,
  user,
  currentStep,
  stepsCount,
  setCurrentStep,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formSubmit] = useSubmitFormMutation();
  const [saveFormInDraft] = useSaveFormInDraftMutation();

  // keep the draft id in redux and the url
  const rememberDraftId = useCallback(
    (id) => {
      if (!id) return;
      dispatch(setCurrentDraftId(id));
      const params = new URLSearchParams(window.location.search);
      if (params.get(STEPPER_PARAMS.DRAFT_ID) === String(id)) return;
      params.set(STEPPER_PARAMS.DRAFT_ID, id);
      const search = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
    },
    [dispatch],
  );

  // upload files and stamp created, updated and updatedBy
  const prepareSectionData = useCallback(
    async (data, name) => {
      const updatedData = await uploadFilesAndReplace(data);
      updatedData.updatedAt = new Date().toISOString();
      updatedData.createdAt = resolveCreatedAt(updatedData.createdAt, formData?.[name]?.createdAt);
      updatedData.updatedBy = buildUpdatedBy(user);
      return updatedData;
    },
    [formData, user],
  );

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep, setCurrentStep]);

  // move on only once the step is saved
  const handleNext = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);
        if (data && name) {
          const updatedData = await prepareSectionData(data, name);
          const res = await saveFormInDraft({
            formId: formDocumentId,
            draftId,
            formData: { ...formData, [name]: updatedData },
          }).unwrap();
          rememberDraftId(res?.data?.draftId);
          unwrapResult(await dispatch(updateFormState({ data: updatedData, name })));
        }
        if (currentStep < stepsCount - 1) setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Save step error:", error);
        toast.error(error?.data?.message || "Error while handling next");
      } finally {
        setLoadingNext(false);
      }
    },
    [
      currentStep,
      dispatch,
      draftId,
      formData,
      formDocumentId,
      prepareSectionData,
      rememberDraftId,
      saveFormInDraft,
      setCurrentStep,
      stepsCount,
    ],
  );

  const handleSubmit = useCallback(
    async ({ data, name, setLoadingNext }) => {
      try {
        setLoadingNext(true);
        if (data && name) {
          const updatedData = await prepareSectionData(data, name);
          const res = await formSubmit({
            formId: formDocumentId,
            draftId,
            formData: { ...formData, [name]: updatedData },
          }).unwrap();
          if (res.success) {
            toast.success(res.message);
            dispatch(resetApplicationProgress());
            navigate(buildSubmissionSuccessPath({ formId: formDocumentId, submissionId: res.data?._id }));
          }
        }
      } catch (error) {
        console.error("Submit form error:", error);
        toast.error(error?.data?.message || "Error while submitting form");
      } finally {
        setLoadingNext(false);
      }
    },
    [dispatch, draftId, formData, formDocumentId, formSubmit, navigate, prepareSectionData],
  );

  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        if (data && name) {
          const updatedData = await uploadFilesAndReplace(data);
          // merge so partial saves keep the other fields
          const oldData = formData?.[name] || {};
          const merged = { ...oldData, ...updatedData };
          merged.updatedAt = new Date().toISOString();
          merged.createdAt = resolveCreatedAt(merged.createdAt, oldData?.createdAt, { keepOwn: true });
          merged.updatedBy = buildUpdatedBy(user);
          const res = await saveFormInDraft({
            formId: formDocumentId,
            draftId,
            formData: { ...formData, [name]: merged },
          }).unwrap();
          if (res.success) {
            rememberDraftId(res?.data?.draftId);
            unwrapResult(await dispatch(updateFormState({ data: merged, name })));
            toast.success(res.message);
          }
        }
      } catch (error) {
        console.error("Save draft error:", error);
        toast.error(error?.data?.message || "Error while saving form in draft");
      }
    },
    [dispatch, draftId, formData, formDocumentId, rememberDraftId, saveFormInDraft, user],
  );

  return { handleNext, handlePrevious, handleSubmit, saveInProgress };
};

export default useApplicantStepSubmission;
