import { useState } from "react";
import { toast } from "react-toastify";
import { useAddBrandingInFormMutation, useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import { executeBrandingAssignment } from "@/utils/executeBrandingAssignment";
import ApplyBranding from "@/components/global/ApplyBranding";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

// branding for one form; the website is set from branding management
const ApplicationFormsBrandingModal = ({ isOpen = false, formId = null, onClose, onApplied }) => {
  const { data: brandings, isLoading: isLoadingBrandings } = useGetAllBrandingsQuery(undefined, { skip: !isOpen });
  const [addFromBranding, { isLoading: isAddingFromBranding }] = useAddBrandingInFormMutation();
  const [selectedBranding, setSelectedBranding] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedBranding(null);
    onClose?.();
  };

  const handleApply = async () => {
    if (!selectedBranding) {
      toast.error("Select a branding");
      return;
    }
    try {
      const res = await executeBrandingAssignment({
        addBrandingMutation: addFromBranding,
        assignment: { brandingId: selectedBranding, formId },
      });
      toast.success(res?.message || "Branding applied successfully");
      setSelectedBranding(null);
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
