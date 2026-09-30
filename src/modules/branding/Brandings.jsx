import { useNavigate } from "react-router-dom";
import { useDeleteSingleBrandingMutation, useGetAllBrandingsQuery } from "@/redux/apis/branding.apis";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import { FaExchangeAlt } from "react-icons/fa";
import { FiAlertCircle, FiEdit2, FiDroplet, FiSearch, FiTrash2 } from "react-icons/fi";
import useConfirm from "@/hooks/useConfirm";
import useListFilter from "@/hooks/useListFilter";
import usePermission from "@/hooks/usePermission";
import ApplyBranding from "@/components/global/ApplyBranding";
import ListFilter from "@/components/global/ListFilter";
import PageHeading from "@/components/global/PageHeading";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import BrandingTable from "./components/BrandingTable";
import useBrandingListApply from "./hooks/useBrandingListApply";
import useBrandingListAssistant from "./hooks/useBrandingListAssistant";
import { PERMISSIONS } from "@/utils/permissions";
import {
  BRANDING_FILTER_KEYS,
  BRANDING_FILTER_FIELDS,
  BRANDING_ROUTES,
  BRANDING_ROW_ACTIONS,
  INITIAL_BRANDING_FILTERS,
} from "./utils/branding.constants";
import { filterBrandings } from "./utils/branding.utils";

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
  const aiConfirm = useConfirm();
  const apply = useBrandingListApply();
  const brandingList = brandings?.data || [];
  const forms = allFormsData?.data || [];
  const { filters, handleChange, clearFilters, hasActiveFilters } = useListFilter(INITIAL_BRANDING_FILTERS);
  const filteredBrandings = filterBrandings(brandingList, forms, filters);
  // applied filter needs the forms list
  const filterFields = canReadForm
    ? BRANDING_FILTER_FIELDS
    : BRANDING_FILTER_FIELDS.filter((field) => field.name !== BRANDING_FILTER_KEYS.APPLIED_TO_FORMS).map((field) =>
        field.name === BRANDING_FILTER_KEYS.SEARCH ? { ...field, className: "sm:col-span-2 lg:col-span-9" } : field,
      );

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
    forms,
    deleteBranding,
    askToDelete: (rows) => deleteConfirm.ask({ rows }),
    askConfirm: aiConfirm.ask,
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
          isLoading={apply.isApplying}
          onClose={apply.closeApplyModal}
          title="Apply Branding"
        />
      )}
      <ConfirmationModal
        isOpen={aiConfirm.isOpen}
        title={aiConfirm.pending?.title}
        message={aiConfirm.pending?.message}
        confirmButtonText={aiConfirm.pending?.confirmButtonText}
        onConfirm={aiConfirm.resolveAsked}
        onClose={aiConfirm.close}
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
      <PageHeading
        className="mb-5"
        title="Brandings"
        description="Colours, logos and emails that style your application forms and website."
        actions={
          canCreateBranding && (
            <Button label="Create Branding" onClick={openCreateBranding} data-testid="branding-create-btn" />
          )
        }
      />
      <section className="mt-5 h-full w-full overflow-y-auto lg:w-[calc(100vw-350px)] xl:w-full">
        {!brandingList.length ? (
          <EmptyState
            variant="panel"
            icon={<FiDroplet size={28} />}
            title="No brandings yet"
            description="Create a branding to style your forms and website."
          />
        ) : (
          <>
            <ListFilter
              className="mb-5"
              fields={filterFields}
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              onChange={handleChange}
              onClear={clearFilters}
            />
            {filteredBrandings.length ? (
              <BrandingTable brandings={filteredBrandings} rowButtons={rowButtons} />
            ) : (
              <EmptyState
                variant="panel"
                icon={<FiSearch size={28} />}
                title="No brandings match your filters"
                description="Try a different search or clear the filters."
              />
            )}
          </>
        )}
      </section>
    </article>
  );
};

export default Brandings;
