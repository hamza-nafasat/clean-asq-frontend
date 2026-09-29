import { useState } from "react";
import { useRemoveSavedFormMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import useResumeDraft from "@/hooks/useResumeDraft";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import MyApplicationsStatusBadge from "./MyApplicationsStatusBadge";
import { SUBMISSION_TYPES } from "@/constants";
import { BRANDED_BUTTON_CLASS, CARD_CLASS } from "../utils/myApplications.constants";
import { buildBrandedButtonStyle, formatLongDate } from "../utils/myApplications.utils";

const MyApplicationsDrafts = ({ forms = [] }) => {
  const resumeDraft = useResumeDraft();
  const [removeSavedForm, { isLoading: isDeleting }] = useRemoveSavedFormMutation();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteDraftHandler = async () => {
    if (!deleteTarget) return;
    try {
      const res = await removeSavedForm({ formId: deleteTarget.formId, draftId: deleteTarget.draftId }).unwrap();
      if (res.success) toast.success(res.message || "Draft deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete draft error:", error);
      toast.error(error?.data?.message || "Failed to delete draft");
    }
  };

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
      {forms?.length > 0 ? (
        forms?.map((form, index) => (
          <article key={form?.draftId || form?._id || index} className={CARD_CLASS}>
            {/* Header */}
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 title={form?.name} className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg">
                  {form?.name}
                </h3>
                <p className="mt-1 truncate text-xs text-gray-500">Started {formatLongDate(form?.draftCreatedAt)}</p>
              </div>
              <MyApplicationsStatusBadge status={SUBMISSION_TYPES.DRAFT} />
            </header>

            {/* Details */}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-gray-500">Sections</dt>
                <dd className="font-medium text-gray-800">{form?.sections?.length ?? 0}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-gray-500">Last saved</dt>
                <dd className="truncate font-medium text-gray-800">{formatLongDate(form?.draftUpdatedAt)}</dd>
              </div>
            </dl>

            {/* Actions */}
            <footer className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                label="Delete"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setDeleteTarget({ formId: form?._id, draftId: form?.draftId, name: form?.name })}
              />
              <Button
                type="button"
                label="Resume"
                className={BRANDED_BUTTON_CLASS}
                style={buildBrandedButtonStyle(form?.branding?.colors)}
                onClick={() =>
                  resumeDraft({ formId: form?._id, draftId: form?.draftId, brandingName: form?.branding?.name })
                }
              />
            </footer>
          </article>
        ))
      ) : (
        <EmptyState
          variant="panel"
          className="col-span-full"
          title="No drafts yet"
          description="Applications you start will appear here."
        />
      )}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteDraftHandler}
        title="Delete Draft"
        message={`Are you sure you want to delete${deleteTarget?.name ? ` “${deleteTarget.name}”` : " this draft"}? This cannot be undone.`}
        isLoading={isDeleting}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default MyApplicationsDrafts;
