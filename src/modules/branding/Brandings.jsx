import { useNavigate } from "react-router-dom";
import { useDeleteSingleBrandingMutation, useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import { FaExchangeAlt } from "react-icons/fa";
import { FiAlertCircle, FiEdit2, FiDroplet, FiTrash2 } from "react-icons/fi";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import ApplyBranding from "@/components/global/ApplyBranding";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import BrandingTable from "./components/BrandingTable";
import useBrandingListApply from "./hooks/useBrandingListApply";
import useBrandingListAssistant from "./hooks/useBrandingListAssistant";
import { PERMISSIONS } from "@/utils/permissions";
import { BRANDING_ROUTES, BRANDING_ROW_ACTIONS } from "./utils/branding.constants";

const Brandings = () => {
  const navigate = useNavigate();
  const canCreateBranding = usePermission(PERMISSIONS.CREATE_BRANDING);
  const canUpdateBranding = usePermission(PERMISSIONS.UPDATE_BRANDING);
  const canDeleteBranding = usePermission(PERMISSIONS.DELETE_BRANDING);
  const canReadForm = usePermission(PERMISSIONS.READ_FORM);

  const { data: allFormsData } = useGetMyAllFormsQuery(undefined, { skip: !canReadForm });
  const { data: brandings = [], isLoading: isBrandingsLoading, isError, refetch } = useGetAllBrandingsQuery();
  const [deleteBranding, { isLoading: isDeleting }] = useDeleteSingleBrandingMutation();
  const deleteConfirm = useConfirm();
  const applyConfirm = useConfirm();
  const apply = useBrandingListApply();
  const brandingList = brandings?.data || [];

  const openBranding = (brandingId) => navigate(`${BRANDING_ROUTES.SINGLE}/${brandingId}`);
  const openCreateBranding = () => navigate(BRANDING_ROUTES.CREATE);

  const rowButtons = [
    canUpdateBranding && {
      name: BRANDING_ROW_ACTIONS.EDIT,
      icon: <FiEdit2 size={16} className="mr-2" />,
      onClick: (row) => openBranding(row?._id),
    },
    canDeleteBranding && {
      name: BRANDING_ROW_ACTIONS.DELETE,
      icon: <FiTrash2 size={16} className="mr-2" />,
      disabled: isDeleting,
      onClick: (row) => deleteConfirm.open({ rows: [row] }),
    },
    canUpdateBranding &&
      canReadForm && {
        name: BRANDING_ROW_ACTIONS.APPLY,
        icon: <FaExchangeAlt size={16} className="mr-2" />,
        onClick: (row) => apply.openApplyModal(row),
      },
  ].filter(Boolean);

  const onConfirmDelete = async () => {
    if (deleteConfirm.resolveAsked()) return;
    const brandingId = deleteConfirm.pending.rows[0]?._id;
    if (!brandingId) {
      toast.error("Branding ID is missing");
      return;
    }
    try {
      const res = await deleteBranding(brandingId).unwrap();
      toast.success(res?.message || "Branding deleted successfully");
      deleteConfirm.close();
    } catch (error) {
      console.error("Delete branding error:", error);
      toast.error(error?.data?.message || "Failed to delete branding");
    }
  };

  useBrandingListAssistant({
    brandings: brandingList,
    forms: allFormsData?.data || [],
    deleteBranding,
    askToDelete: (rows) => deleteConfirm.ask({ rows }),
    askToApply: applyConfirm.ask,
    applyToTargets: apply.applyToTargets,
    openBranding,
    openCreateBranding,
  });

  if (isBrandingsLoading) return <LoadingState title="Loading brandings" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load brandings">
        <Button type="button" label="Try again" onClick={refetch} />
      </EmptyState>
    );

  const deleteNames = (deleteConfirm.pending?.rows || []).map((row) => row?.name || row?._id).join(", ");

  return (
    <article className="mt-5 w-full" data-testid="branding-page">
      {apply.isApplyModalOpen && (
        <ConfirmationModal
          isOpen={apply.isApplyModalOpen}
          message={
            <ApplyBranding
              brandingId={apply.brandingId}
              selectedFormIds={apply.selectedFormIds}
              setSelectedFormIds={apply.setSelectedFormIds}
              setOnHome={apply.setOnHome}
              onHome={apply.onHome}
              setIsDefault={apply.setIsDefault}
              isDefault={apply.isDefault}
            />
          }
          confirmButtonText="Apply Branding"
          onConfirm={apply.confirmApply}
          onClose={apply.closeApplyModal}
          title="Apply Branding"
        />
      )}
      <ConfirmationModal
        isOpen={applyConfirm.isOpen}
        title="Apply Branding"
        message={applyConfirm.pending?.message}
        confirmButtonText="Apply Branding"
        onConfirm={applyConfirm.resolveAsked}
        onClose={applyConfirm.close}
      />
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Branding"
        message={`Are you sure you want to delete ${deleteNames}? This action cannot be undone.`}
        confirmButtonText="Delete Branding"
        isLoading={isDeleting}
        onConfirm={onConfirmDelete}
        onClose={deleteConfirm.close}
      />
      {canCreateBranding && (
        <header className="mb-4 flex justify-end">
          <Button label="Create Branding" onClick={openCreateBranding} data-testid="branding-create-btn" />
        </header>
      )}
      <section className="mt-5 w-full h-full overflow-y-auto lg:w-[calc(100vw-350px)] xl:w-full">
        {brandingList.length ? (
          <BrandingTable brandings={brandingList} rowButtons={rowButtons} />
        ) : (
          <EmptyState
            variant="panel"
            icon={<FiDroplet size={28} />}
            title="No brandings yet"
            description="Create a branding to style your forms and website."
          />
        )}
      </section>
    </article>
  );
};

export default Brandings;
