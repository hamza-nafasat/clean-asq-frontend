import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAddBrandingInFormMutation, useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import useBranding from "@/hooks/useBranding";
import { executeBrandingAssignment, getBrandingSettersFromHook } from "@/utils/executeBrandingAssignment";
import ApplyBranding from "@/components/global/ApplyBranding";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { createUserRefreshDispatcher } from "../utils/applicationForms.utils2";

const ApplicationFormsBrandingModal = ({ isOpen = false, formId = null, onClose, onApplied, refetch }) => {
  const dispatch = useDispatch();
  const brandingSetters = getBrandingSettersFromHook(useBranding());
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const { data: brandings, isLoading: isLoadingBrandings } = useGetAllBrandingsQuery();
  const [addFromBranding, { isLoading: isAddingFromBranding }] = useAddBrandingInFormMutation();
  const [selectedBranding, setSelectedBranding] = useState(null);
  const [onHome, setOnHome] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!selectedBranding) {
      toast.error("Branding ID is missing");
      return;
    }
    if (!formId && !onHome) {
      toast.error("Form ID is required if onHome is not provided");
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
      await refetch?.();
      toast?.success(res?.message || "Branding applied successfully");
    } catch (error) {
      console.error("Apply branding error:", error);
      toast.error(error?.message || error?.data?.message || "Failed to apply branding");
    } finally {
      setSelectedBranding(null);
      setOnHome(false);
      onApplied?.();
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
      confirmButtonClassName="border-none hover:bg-red-600 text-white"
      cancelButtonText="cancel"
      onConfirm={handleApply}
      onClose={onClose}
      title={"Apply Branding"}
    />
  );
};

export default ApplicationFormsBrandingModal;
