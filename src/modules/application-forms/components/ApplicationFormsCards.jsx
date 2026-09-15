import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useDeleteSingleFormMutation, useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import useApplicationFormsScreenContext from "@/hooks/useApplicationFormsScreenContext";
import useBranding from "@/hooks/useBranding";
import { LocationModalComponent } from "@/components/modals/LocationStatusModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import CustomLoading from "@/components/shared/CustomLoading";
import Modal from "@/components/shared/Modal";
import ApplicationFormsBrandingModal from "./ApplicationFormsBrandingModal";
import ApplicationFormsCard from "./ApplicationFormsCard";
import ApplicationFormsConfigurationModal from "./ApplicationFormsConfigurationModal";
import ApplicationFormsCreateModal from "./ApplicationFormsCreateModal";
import ApplicationFormsFilter from "./ApplicationFormsFilter";
import ApplicationFormsHeading from "./ApplicationFormsHeading";
import { INITIAL_FORM_FILTERS, INITIAL_FORM_LOCATION_DATA } from "../utils/application-forms.constants";

const ApplicationsCard = () => {
  const { logo } = useBranding();
  const { data: forms, refetch, isLoading: isLoadingForms } = useGetMyAllFormsQuery();
  const [deleteForm] = useDeleteSingleFormMutation();

  const [filters, setFilters] = useState(INITIAL_FORM_FILTERS);
  const [actionMenu, setActionMenu] = useState(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [brandingFormId, setBrandingFormId] = useState(null);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [formToUpdate, setFormToUpdate] = useState(null);
  const [locationModal, setLocationModal] = useState(false);
  const [formLocationData, setFormLocationData] = useState(INITIAL_FORM_LOCATION_DATA);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeletingForm, setIsDeletingForm] = useState(false);

  const handleOpenCreateForm = () => setIsCreateFormOpen(true);

  useApplicationFormsScreenContext({ onOpenCreateForm: handleOpenCreateForm });

  const handleCloseMenu = useCallback(() => setActionMenu(null), []);

  const handleToggleMenu = (formId) => setActionMenu((prev) => (prev === formId ? null : formId));

  const handleSetBranding = (form) => {
    setBrandingFormId(form?._id);
    setIsBrandingOpen(true);
  };

  const handleBrandingApplied = () => {
    setIsBrandingOpen(false);
    setBrandingFormId(null);
    setActionMenu(null);
  };

  const handleSetLocation = (form) => {
    setLocationModal(form?._id);
    setFormLocationData({
      title: form?.locationTitle,
      subtitle: form?.locationSubtitle,
      status: form?.locationStatus,
      message: form?.locationMessage,
      formatedText: form?.formatedLocationMessage,
      formatingTextInstructions: form?.formateTextInstructions,
    });
  };

  const handleDeleteForm = async () => {
    try {
      if (!deleteConfirmation) return;
      setIsDeletingForm(true);
      const res = await deleteForm({ _id: deleteConfirmation }).unwrap();
      if (res?.success) {
        await refetch();
        toast?.success(res?.message || "Form deleted successfully");
      }
    } catch (error) {
      console.error("Delete form error:", error);
      toast.error(error?.data?.message || "Failed to delete form");
    } finally {
      setDeleteConfirmation(null);
      setIsDeletingForm(false);
    }
  };

  if (isLoadingForms) return <CustomLoading />;

  return (
    <article className="bg-backgroundColor  rounded-md p-5 shadow" data-testid="forms-page">
      {/* Modals */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteForm}
        isLoading={isDeletingForm}
        title="Delete Form"
        message={`Are you sure you want to delete this form?`}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
      <ApplicationFormsBrandingModal
        isOpen={isBrandingOpen}
        formId={brandingFormId}
        onClose={() => setIsBrandingOpen(false)}
        onApplied={handleBrandingApplied}
        refetch={refetch}
      />
      {formToUpdate && (
        <Modal onClose={() => setFormToUpdate(null)} title="Update Form">
          <ApplicationFormsConfigurationModal
            form={formToUpdate}
            refetch={refetch}
            setModal={() => setFormToUpdate(null)}
          />
        </Modal>
      )}
      {locationModal && (
        <Modal onClose={() => setLocationModal(false)} title="Set Location">
          <LocationModalComponent
            locationModal={locationModal}
            setLocationModal={setLocationModal}
            refetch={refetch}
            formLocationData={formLocationData}
          />
        </Modal>
      )}
      {isCreateFormOpen && <ApplicationFormsCreateModal onClose={() => setIsCreateFormOpen(false)} refetch={refetch} />}

      <ApplicationFormsHeading onCreateForm={handleOpenCreateForm} />
      <ApplicationFormsFilter filters={filters} setFilters={setFilters} />

      {/* Cards */}
      <section className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full ">
        {forms?.data?.length > 0 ? (
          forms?.data?.map((form, index) => (
            <ApplicationFormsCard
              key={form?._id ?? index}
              form={form}
              logo={logo}
              isMenuOpen={actionMenu === form?._id}
              onToggleMenu={handleToggleMenu}
              onCloseMenu={handleCloseMenu}
              onUpdateForm={setFormToUpdate}
              onSetBranding={handleSetBranding}
              onSetLocation={handleSetLocation}
              onDelete={setDeleteConfirmation}
            />
          ))
        ) : (
          <div className="flex w-full justify-center">
            <p className="text-gray-500 font-bold text-2xl">No data found</p>
          </div>
        )}
      </section>
    </article>
  );
};

export { default as FormConfigurationModal } from "./ApplicationFormsConfigurationModal";

export default ApplicationsCard;
