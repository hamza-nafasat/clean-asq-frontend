import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAddBrandingInFormMutation } from "@/redux/apis/branding.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import useBranding from "@/hooks/useBranding";
import {
  executeBrandingAssignment,
  executeBrandingAssignments,
  getBrandingSettersFromHook,
} from "@/utils/executeBrandingAssignment";

// apply branding to forms or home
const useBrandingListApply = () => {
  const dispatch = useDispatch();
  const branding = useBranding();
  const [applyRow, setApplyRow] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [onHome, setOnHome] = useState(false);
  const [addBrandingInForm] = useAddBrandingInFormMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();

  const dispatchUserRefresh = async (profileRes) => {
    if (profileRes?.success) dispatch(userExist(profileRes.data));
    else dispatch(userNotExist());
  };

  const assignmentOptions = {
    addBrandingMutation: addBrandingInForm,
    getUserProfile,
    brandingSetters: getBrandingSettersFromHook(branding),
    dispatchUserRefresh,
  };

  const closeApplyModal = () => {
    setApplyRow(null);
    setSelectedId(null);
    setOnHome(false);
  };

  const confirmApply = async () => {
    const brandingId = applyRow?._id;
    if (!brandingId) {
      toast.error("Branding ID is missing");
      return;
    }
    if (!selectedId && !onHome) {
      toast.error("Form ID is required if onHome is not provided");
      return;
    }
    try {
      const res = await executeBrandingAssignment({
        ...assignmentOptions,
        assignment: { brandingId, formId: selectedId || undefined, applyToHome: onHome },
      });
      toast.success(res?.message || "Branding applied successfully");
    } catch (error) {
      console.error("Apply branding error:", error);
      toast.error(error?.message || error?.data?.message || "Failed to apply branding");
    } finally {
      closeApplyModal();
    }
  };

  const applyToTargets = ({ brandingId, formIds = [], onHome: applyToHome }) =>
    executeBrandingAssignments({
      ...assignmentOptions,
      updates: [
        ...(applyToHome ? [{ brandingId, applyToHome: true }] : []),
        ...formIds.map((formId) => ({ brandingId, formId })),
      ],
    });

  return {
    isApplyModalOpen: Boolean(applyRow),
    openApplyModal: setApplyRow,
    closeApplyModal,
    confirmApply,
    selectedId,
    setSelectedId,
    onHome,
    setOnHome,
    applyToTargets,
  };
};

export default useBrandingListApply;
