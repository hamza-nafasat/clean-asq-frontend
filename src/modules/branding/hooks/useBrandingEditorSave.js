import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useCreateBrandingMutation, useUpdateSingleBrandingMutation } from "@/redux/apis/branding.apis";
import { userExist } from "@/redux/slices/auth.slice";
import useBrandingConfirm from "./useBrandingConfirm";
import { BRANDING_REQUIRED_FIELDS_WITHOUT_INPUT, BRANDING_ROUTES } from "../utils/branding.constants";
import {
  applySavedAiToGlobal,
  applyUserBrandingToGlobal,
  buildBrandingFormData,
  getMissingFieldErrors,
} from "../utils/branding.save.utils";

const MISSING_FIELDS_MESSAGE = "Please fill all fields before saving branding";

const useBrandingEditorSave = ({ brandingId, values, branding }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submittedErrors, setSubmittedErrors] = useState({});
  const updateConfirm = useBrandingConfirm();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [createBranding, { isLoading: isCreateLoading }] = useCreateBrandingMutation();
  const [updateBranding, { isLoading: isUpdateLoading }] = useUpdateSingleBrandingMutation();

  // hide errors once filled
  const missingErrors = getMissingFieldErrors(values);
  const errors = Object.fromEntries(Object.entries(submittedErrors).filter(([field]) => missingErrors[field]));

  const validateBranding = () => {
    setSubmittedErrors(missingErrors);
    if (!Object.keys(missingErrors).length) return true;
    if (BRANDING_REQUIRED_FIELDS_WITHOUT_INPUT.some((field) => missingErrors[field])) toast.error(MISSING_FIELDS_MESSAGE);
    return false;
  };

  const createBrandingHandler = async (skipNavigation = false) => {
    if (!validateBranding()) throw new Error(MISSING_FIELDS_MESSAGE);
    try {
      const res = await createBranding(buildBrandingFormData(values)).unwrap();
      toast.success(res?.message || "Branding created successfully!");
      if (!skipNavigation) navigate(BRANDING_ROUTES.LIST);
      return res?.data?._id;
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create branding. Please try again.");
      throw error;
    }
  };

  const updateBrandingHandler = async (skipNavigation = false) => {
    if (!brandingId) {
      toast.error("Branding ID is missing");
      throw new Error("Branding ID is missing");
    }
    if (!validateBranding()) throw new Error(MISSING_FIELDS_MESSAGE);
    try {
      const updateRes = await updateBranding({ brandingId, data: buildBrandingFormData(values) }).unwrap();
      applySavedAiToGlobal(updateRes.data, branding);

      const profileRes = await getUserProfile().unwrap();
      if (profileRes?.data?.branding?.colors) {
        applyUserBrandingToGlobal(profileRes.data.branding, branding);
        dispatch(userExist(profileRes.data));
      }

      toast.success(updateRes?.message || "Branding updated successfully!");
      if (!skipNavigation) navigate(BRANDING_ROUTES.LIST);
      return brandingId;
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update branding. Please try again.");
      throw error;
    }
  };

  const handleSave = async () => {
    if (!validateBranding()) return;
    if (brandingId) {
      updateConfirm.open();
      return;
    }
    try {
      await createBrandingHandler();
    } catch (error) {
      console.error("Create branding error:", error);
    }
  };

  const confirmUpdate = async () => {
    if (updateConfirm.resolveAsked()) return;
    try {
      await updateBrandingHandler();
    } catch (error) {
      console.error("Update branding error:", error);
    }
    updateConfirm.close();
  };

  return {
    errors,
    handleSave,
    confirmUpdate,
    updateConfirm,
    createBrandingHandler,
    updateBrandingHandler,
    isSaving: isCreateLoading || isUpdateLoading,
  };
};

export default useBrandingEditorSave;
