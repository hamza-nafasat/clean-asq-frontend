import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { FiFileText, FiSearch } from "react-icons/fi";
import { useDeleteSingleFormMutation } from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import EmptyState from "@/components/shared/EmptyState";
import ApplicationFormsBrandingModal from "./ApplicationFormsBrandingModal";
import ApplicationFormsCard from "./ApplicationFormsCard";
import ApplicationFormsConfigurationModal from "./ApplicationFormsConfigurationModal";
import ApplicationFormsLocationModal from "./ApplicationFormsLocationModal";

const ApplicationFormsCards = ({ forms = [], isFiltering = false }) => {
  const { logo } = useBranding();
  const [deleteForm, { isLoading: isDeletingForm }] = useDeleteSingleFormMutation();
  const [actionMenu, setActionMenu] = useState(null);
  const [formToBrand, setFormToBrand] = useState(null);
  const [formToUpdate, setFormToUpdate] = useState(null);
  const [formToLocate, setFormToLocate] = useState(null);
  const [formToDelete, setFormToDelete] = useState(null);

  const handleCloseMenu = useCallback(() => setActionMenu(null), []);

  const handleToggleMenu = (formId) => setActionMenu((prev) => (prev === formId ? null : formId));

  const handleBrandingApplied = () => {
    setFormToBrand(null);
    setActionMenu(null);
  };

  const handleDeleteForm = async () => {
    try {
      const res = await deleteForm({ _id: formToDelete }).unwrap();
      toast.success(res?.message || "Form deleted successfully");
      setFormToDelete(null);
    } catch (error) {
      console.error("Delete form error:", error);
      toast.error(error?.data?.message || "Failed to delete form");
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={Boolean(formToDelete)}
        onClose={() => setFormToDelete(null)}
        onConfirm={handleDeleteForm}
        isLoading={isDeletingForm}
        title="Delete Form"
        message="Are you sure you want to delete this form?"
        confirmButtonText="Delete"
      />
      <ApplicationFormsBrandingModal
        isOpen={Boolean(formToBrand)}
        formId={formToBrand}
        onClose={() => setFormToBrand(null)}
        onApplied={handleBrandingApplied}
      />
      <ApplicationFormsConfigurationModal
        key={formToUpdate?._id}
        isOpen={Boolean(formToUpdate)}
        initialData={formToUpdate}
        onClose={() => setFormToUpdate(null)}
      />
      <ApplicationFormsLocationModal
        key={formToLocate?._id}
        isOpen={Boolean(formToLocate)}
        initialData={formToLocate}
        onClose={() => setFormToLocate(null)}
      />

      <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {forms.map((form) => (
          <ApplicationFormsCard
            key={form?._id}
            form={form}
            logo={logo}
            isMenuOpen={actionMenu === form?._id}
            onToggleMenu={handleToggleMenu}
            onCloseMenu={handleCloseMenu}
            onUpdateForm={setFormToUpdate}
            onSetBranding={(selected) => setFormToBrand(selected?._id)}
            onSetLocation={setFormToLocate}
            onDelete={setFormToDelete}
          />
        ))}
        {!forms.length && isFiltering && (
          <EmptyState
            variant="panel"
            icon={<FiSearch size={28} />}
            title="No forms match your search"
            description="Try a different name or date range."
            className="col-span-full"
          />
        )}
        {!forms.length && !isFiltering && (
          <EmptyState
            variant="panel"
            icon={<FiFileText size={28} />}
            title="No application forms yet"
            description="Create a form to start collecting applications."
            className="col-span-full"
          />
        )}
      </section>
    </>
  );
};

export default ApplicationFormsCards;
