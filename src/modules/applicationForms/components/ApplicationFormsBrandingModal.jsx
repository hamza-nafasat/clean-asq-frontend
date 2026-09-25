import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAddBrandingInFormMutation, useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import useBranding from "@/hooks/useBranding";
import { executeBrandingAssignment, getBrandingSettersFromHook } from "@/utils/executeBrandingAssignment";
import ApplyBranding from "@/components/global/ApplyBranding";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { createUserRefreshDispatcher } from "../utils/applicationForms.branding.utils";

const ApplicationFormsBrandingModal = ({ isOpen = false, formId = null, onClose, onApplied }) => {
  const dispatch = useDispatch();
  const brandingSetters = getBrandingSettersFromHook(useBranding());
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const { data: brandings, isLoading: isLoadingBrandings } = useGetAllBrandingsQuery(undefined, { skip: !isOpen });
  const [addFromBranding, { isLoading: isAddingFromBranding }] = useAddBrandingInFormMutation();
  const [selectedBranding, setSelectedBranding] = useState(null);
  const [onHome, setOnHome] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedBranding(null);
    setOnHome(false);
    onClose?.();
  };

  const handleApply = async () => {
    if (!selectedBranding) {
      toast.error("Select a branding");
      return;
    }
    if (!formId && !onHome) {
      toast.error("Choose a form or apply the branding to home");
      return;
    }
    try {
      const res = await executeBrandingAssignment({
        addBrandingMutation: addFromBranding,
        getUserProfile,
        brandingSetters,
        dispatchUserRefresh: createUserRefreshDispatcher(dispatch),
        assignment: {
          brandingId: selectedBranding,
          formId: formId || undefined,
          applyToHome: onHome,
        },
      });
      toast.success(res?.message || "Branding applied successfully");
      setSelectedBranding(null);
      setOnHome(false);
      onApplied?.();
    } catch (error) {
      console.error("Apply branding error:", error);
      toast.error(error?.data?.message || error?.message || "Failed to apply branding");
    }
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      isLoading={isAddingFromBranding || isLoadingBrandings}
      message={
        <ApplyBranding
          brandings={brandings?.data}
          setSelectedId={setSelectedBranding}
          selectedId={selectedBranding}
          setOnHome={setOnHome}
          onHome={onHome}
        />
      }
      confirmButtonText="Apply Branding"
      onConfirm={handleApply}
      onClose={handleClose}
      title={"Apply Branding"}
    />
  );
};

export default ApplicationFormsBrandingModal;
