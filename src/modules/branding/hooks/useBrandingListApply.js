import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import {
  useAddBrandingInFormMutation,
  useClearDefaultBrandingMutation,
  useSetDefaultBrandingMutation,
} from "@/redux/apis/branding.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import useBranding from "@/hooks/useBranding";
import {
  executeBrandingAssignments,
  getBrandingSettersFromHook,
} from "@/utils/executeBrandingAssignment";

// apply branding to forms or home
const useBrandingListApply = () => {
  const dispatch = useDispatch();
  const branding = useBranding();
  const [applyRow, setApplyRow] = useState(null);
  const [selectedFormIds, setSelectedFormIds] = useState([]);
  const [onHome, setOnHome] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [addBrandingInForm] = useAddBrandingInFormMutation();
  const [setDefaultBranding] = useSetDefaultBrandingMutation();
  const [clearDefaultBranding] = useClearDefaultBrandingMutation();
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

  const openApplyModal = (row) => {
    setApplyRow(row);
    setIsDefault(Boolean(row?.isDefault));
  };

  const closeApplyModal = () => {
    setApplyRow(null);
    setSelectedFormIds([]);
    setOnHome(false);
    setIsDefault(false);
  };

  const updateDefaultBranding = async (brandingId) => {
    const wasDefault = Boolean(applyRow?.isDefault);
    if (isDefault && !wasDefault) return setDefaultBranding(brandingId).unwrap();
    if (!isDefault && wasDefault) return clearDefaultBranding().unwrap();
  };

  const applyToTargets = ({ brandingId, formIds = [], onHome: applyToHome }) =>
    executeBrandingAssignments({
      ...assignmentOptions,
      updates: [
        ...(applyToHome ? [{ brandingId, applyToHome: true }] : []),
        ...formIds.map((formId) => ({ brandingId, formId })),
      ],
    });

  const confirmApply = async () => {
    const brandingId = applyRow?._id;
    if (!brandingId) {
      toast.error("Branding ID is missing");
      return;
    }
    const isDefaultChanged = isDefault !== Boolean(applyRow?.isDefault);
    if (!selectedFormIds.length && !onHome && !isDefaultChanged) {
      toast.error("Choose a form, the website or the default");
      return;
    }
    try {
      const assignmentRes =
        (selectedFormIds.length || onHome) &&
        (await applyToTargets({ brandingId, formIds: selectedFormIds, onHome }));
      const defaultRes = await updateDefaultBranding(brandingId);
      toast.success(defaultRes?.message || assignmentRes?.message || "Branding applied successfully");
    } catch (error) {
      console.error("Apply branding error:", error);
      toast.error(error?.message || error?.data?.message || "Failed to apply branding");
    } finally {
      closeApplyModal();
    }
  };

  return {
    isApplyModalOpen: Boolean(applyRow),
    openApplyModal,
    closeApplyModal,
    confirmApply,
    brandingId: applyRow?._id,
    selectedFormIds,
    setSelectedFormIds,
    onHome,
    setOnHome,
    isDefault,
    setIsDefault,
    applyToTargets,
  };
};

export default useBrandingListApply;
