import { useCreateSearchStrategyDefaultMutation, useCreateSearchStrategyMutation } from "@/redux/apis/form.apis";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import usePermission from "@/hooks/usePermission";
import Button from "@/components/shared/Button";
import PageHeading from "@/components/global/PageHeading";
import LookupManagementAddEditModal from "./LookupManagementAddEditModal";
import { MODAL_MODES } from "@/constants";
import { PERMISSIONS } from "@/utils/permissions";

// addModal: null when closed, else { draft, key }
const LookupManagementHeading = ({ addModal = null, onOpenAdd, onCloseAdd }) => {
  const canCreateLookup = usePermission(PERMISSIONS.CREATE_LOOKUP);
  const [createSearchStrategy, { isLoading: isCreating }] = useCreateSearchStrategyMutation();
  const [createDefaultStrategies, { isLoading: isCreatingDefault }] = useCreateSearchStrategyDefaultMutation();

  const handleCreateDefault = async () => {
    try {
      const res = await createDefaultStrategies().unwrap();
      if (res.success) toast.success(res.message);
    } catch (error) {
      console.error("Create default lookup keys error:", error);
      toast.error(error?.data?.message || "Failed to create default lookup keys");
    }
  };

  const handleAddLookup = async (lookup) => {
    try {
      const res = await createSearchStrategy({ data: lookup }).unwrap();
      if (!res?.success) return;
      toast.success(res.message);
      onCloseAdd?.();
    } catch (error) {
      console.error("Create lookup key error:", error);
      toast.error(error?.data?.message || "Failed to create lookup key");
    }
  };

  return (
    <>
      <PageHeading
        className="mb-5"
        title="Lookup Management"
        description="Choose what company data is looked up and how it is extracted from each application."
        actions={
          canCreateLookup && (
            <>
              <Button
                variant="secondary"
                label="Create Default"
                onClick={handleCreateDefault}
                loading={isCreatingDefault}
              />
              <Button icon={FiPlus} label="Add Lookup Key" onClick={() => onOpenAdd?.()} disabled={isCreating} />
            </>
          )
        }
      />

      <LookupManagementAddEditModal
        isOpen={Boolean(addModal)}
        mode={MODAL_MODES.ADD}
        initialData={addModal?.draft}
        draftKey={addModal?.key}
        onClose={onCloseAdd}
        onSubmit={handleAddLookup}
        isLoading={isCreating}
      />
    </>
  );
};

export default LookupManagementHeading;
