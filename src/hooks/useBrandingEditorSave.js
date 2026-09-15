import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useCreateBrandingMutation, useUpdateSingleBrandingMutation } from "@/redux/apis/branding.apis";
import { userExist } from "@/redux/slices/auth.slice";
import { BRANDING_ROUTES } from "@/modules/branding/utils/branding.constants";
import {
  applySavedAiToGlobal,
  applyUserBrandingToGlobal,
  buildBrandingFormData,
  hasMissingBrandingFields,
} from "@/modules/branding/utils/branding.utils4";

const MISSING_FIELDS_MESSAGE = "Please fill all fields before creating branding";

const useBrandingEditorSave = ({ values, branding }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [createBranding, { isLoading: isCreateLoading }] = useCreateBrandingMutation();
  const [updateBranding, { isLoading: isUpdateLoading }] = useUpdateSingleBrandingMutation();

  const createBrandingHandler = async (skipNavigation = false) => {
    if (hasMissingBrandingFields(values)) {
      toast.error(MISSING_FIELDS_MESSAGE);
      throw new Error(MISSING_FIELDS_MESSAGE);
    }
    const formData = buildBrandingFormData(values, { isCreate: true });
    try {
      const res = await createBranding(formData).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Branding created successfully!");
        if (!skipNavigation) navigate(BRANDING_ROUTES.LIST);
        return res?.data?._id;
      }
      toast.error("Failed to create branding. Please try again.");
    } catch (error) {
      console.error("Create branding error:", error);
      toast.error(error?.data?.message || "Failed to create branding. Please try again.");
    }
  };

  const updateBrandingHandler = async (brandingId, skipNavigation = false) => {
    if (!brandingId || hasMissingBrandingFields(values)) return toast.error(MISSING_FIELDS_MESSAGE);
    const formData = buildBrandingFormData(values);
    try {
      const updateRes = await updateBranding({ brandingId, data: formData }).unwrap();
      if (!updateRes?.success) {
        toast.error("Failed to update branding. Please try again.");
        return;
      }
      // the profile only returns the home branding, so apply the saved ai colours directly
      applySavedAiToGlobal(updateRes.data, branding);

      const res = await getUserProfile().unwrap();
      if (res?.data?.branding?.colors) {
        applyUserBrandingToGlobal(res.data.branding, branding);
        // keep redux in sync so applied branding restores fresh values
        dispatch(userExist(res.data));
      }

      toast.success(res?.message || "Branding updated successfully!");
      if (!skipNavigation) navigate(BRANDING_ROUTES.LIST);
      return brandingId;
    } catch (error) {
      console.error("Update branding error:", error);
      toast.error(error?.data?.message || "Failed to update branding. Please try again.");
    }
  };

  return {
    createBrandingHandler,
    updateBrandingHandler,
    isSaving: isCreateLoading || isUpdateLoading,
  };
};

export default useBrandingEditorSave;
