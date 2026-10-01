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
import ListFilter from "@/components/global/ListFilter";
import ApplicationFormsHeading from "./components/ApplicationFormsHeading";
import useApplicationFormsScreenContext from "./hooks/useApplicationFormsScreenContext";
import { FORM_FILTER_FIELDS, INITIAL_FORM_FILTERS } from "./utils/applicationForms.constants";
import { filterForms } from "./utils/applicationForms.filter.utils";
import useListFilter from "@/hooks/useListFilter";

const ApplicationForms = () => {
  const { data: forms, isLoading, isError, refetch } = useGetMyAllFormsQuery();
  const { filters, handleChange, clearFilters, hasActiveFilters } = useListFilter(INITIAL_FORM_FILTERS);
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
    <article className="mt-5 w-full" data-testid="forms-page">
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
      <ListFilter
        fields={FORM_FILTER_FIELDS}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        className="mb-5"
        onChange={handleChange}
        onClear={clearFilters}
      />

      <ApplicationFormsCards forms={filteredForms} isFiltering={hasActiveFilters} />
    </article>
  );
};

export default ApplicationForms;
