import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { useGetSavedFormMutation, useRemoveSavedFormMutation } from "@/redux/apis/form.apis";
import { addSavedFormData, setCurrentDraftId, updateEmailVerified } from "@/redux/slices/form.slice";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import MyApplicationsStatusBadge from "./MyApplicationsStatusBadge";
import { APPLICATION_STATUS } from "@/utils/applicationStatus";
import { CARD_CLASS } from "../utils/myApplications.constants";
import {
  buildApplicationFormPath,
  buildBrandedButtonStyle,
  buildVerificationPath,
  dimOnHover,
  formatLongDate,
  undimOnLeave,
} from "../utils/myApplications.utils";

const MyApplicationsDrafts = ({ forms = [] }) => {
  const dispatch = useDispatch();
  const { emailVerified } = useSelector((state) => state.form);
  const navigate = useNavigate();
  const [getSavedFormData] = useGetSavedFormMutation();
  const [removeSavedForm, { isLoading: isDeleting }] = useRemoveSavedFormMutation();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getSavedData = async (formId, brandingName, draftId) => {
    try {
      if (!emailVerified) dispatch(updateEmailVerified(true));
      if (draftId) dispatch(setCurrentDraftId(draftId));
      const res = await getSavedFormData({ formId: formId, draftId }).unwrap();
      if (!res.success) return navigate(buildVerificationPath(formId, draftId));
      const savedData = res?.data?.savedData || [];
      const action = await dispatch(addSavedFormData(savedData || []));
      unwrapResult(action);
      if (!savedData?.company_lookup_data) return navigate(buildVerificationPath(formId, draftId));
      return navigate(buildApplicationFormPath(brandingName, formId, draftId));
    } catch (error) {
      console.error("Get saved form error:", error);
      return navigate(buildVerificationPath(formId, draftId));
    }
  };

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
        forms?.map((form, index) => {
          const brandedStyle = buildBrandedButtonStyle(form?.branding?.colors);

          return (
            <div key={form?.draftId || form?._id || index} className={CARD_CLASS}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2
                    title={form?.name}
                    className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg"
                  >
                    {form?.name}
                  </h2>
                  <p className="mt-1 truncate text-xs text-gray-500">Started {formatLongDate(form?.createdAt)}</p>
                </div>
                <MyApplicationsStatusBadge status={APPLICATION_STATUS.draft} />
              </div>

              {/* Details */}
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500">Sections</dt>
                  <dd className="font-medium text-gray-800">{form?.sections?.length ?? 0}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-gray-500">Assistance</dt>
                  <dd className="truncate font-medium text-gray-800">AI-assisted completion</dd>
                </div>
              </dl>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  label="Delete"
                  className="w-full sm:w-auto"
                  onClick={() => setDeleteTarget({ formId: form?._id, draftId: form?.draftId, name: form?.name })}
                  style={brandedStyle}
                  onMouseEnter={dimOnHover}
                  onMouseLeave={undimOnLeave}
                />
                <Button
                  type="button"
                  label="Resume"
                  className="w-full sm:w-auto"
                  onClick={() => getSavedData(form?._id, form?.branding?.name, form?.draftId)}
                  style={brandedStyle}
                  onMouseEnter={dimOnHover}
                  onMouseLeave={undimOnLeave}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div className="items-cetner col-span-full flex justify-center">No draft found</div>
      )}
      <ConfirmationModal
        isOpen={!!deleteTarget}
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
