import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import ApplicationFormsCards from "./components/ApplicationFormsCards";
import ApplicationFormsCreateModal from "./components/ApplicationFormsCreateModal";
import ApplicationFormsFilter from "./components/ApplicationFormsFilter";
import ApplicationFormsHeading from "./components/ApplicationFormsHeading";
import useApplicationFormsScreenContext from "./hooks/useApplicationFormsScreenContext";
import { INITIAL_FORM_FILTERS } from "./utils/applicationForms.constants";
import { filterForms, hasActiveFormFilters } from "./utils/applicationForms.filter.utils";

const ApplicationForms = () => {
  const { data: forms, isLoading, isError, refetch } = useGetMyAllFormsQuery();
  const [filters, setFilters] = useState(INITIAL_FORM_FILTERS);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const aiConfirm = useConfirm();

  useApplicationFormsScreenContext({
    onOpenCreateForm: () => setIsCreateFormOpen(true),
    askConfirm: aiConfirm.ask,
  });

  if (isLoading) return <LoadingState title="Loading forms" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load forms">
        <Button type="button" label="Try again" onClick={refetch} />
      </EmptyState>
    );

  const filteredForms = filterForms(forms?.data, filters);

  return (
    <article className="bg-backgroundColor rounded-md p-5 shadow" data-testid="forms-page">
      <ConfirmationModal
        isOpen={aiConfirm.isOpen}
        title={aiConfirm.pending?.title}
        message={aiConfirm.pending?.message}
        confirmButtonText={aiConfirm.pending?.confirmButtonText}
        onConfirm={aiConfirm.resolveAsked}
        onClose={aiConfirm.close}
      />
      <ApplicationFormsCreateModal isOpen={isCreateFormOpen} onClose={() => setIsCreateFormOpen(false)} />

      <ApplicationFormsHeading onCreateForm={() => setIsCreateFormOpen(true)} />
      <ApplicationFormsFilter filters={filters} setFilters={setFilters} />

      <ApplicationFormsCards forms={filteredForms} isFiltering={hasActiveFormFilters(filters)} />
    </article>
  );
};

export default ApplicationForms;
