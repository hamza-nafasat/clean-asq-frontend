import ApplicationStatusBadge from "@/components/shared/small/ApplicationStatusBadge";
import { APPLICATION_STATUS } from "@/lib/applicationStatus";
import { addSavedFormData, setCurrentDraftId, updateEmailVerified } from "@/redux/slices/formSlice";
import { useGetSavedFormMutation, useRemoveSavedFormMutation } from "@/redux/apis/formApis";
import { unwrapResult } from "@reduxjs/toolkit";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import Button from "../shared/small/Button";

function Draft({ forms }) {
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
      if (res.success) {
        const savedData = res?.data?.savedData || [];
        const action = await dispatch(addSavedFormData(savedData || []));
        unwrapResult(action);
        const draftQuery = draftId ? `&draftId=${draftId}` : "";
        if (!savedData?.company_lookup_data) {
          return navigate(`/verification?formid=${formId}${draftQuery}`);
        } else {
          return navigate(`/application-form/${brandingName}/${formId}${draftId ? `?draftId=${draftId}` : ""}`);
        }
      } else {
        return navigate(`/verification?formid=${formId}${draftId ? `&draftId=${draftId}` : ""}`);
      }
    } catch (error) {
      console.log("error while getting saved data", error);
      return navigate(`/verification?formid=${formId}${draftId ? `&draftId=${draftId}` : ""}`);
    }
  };

  const deleteDraftHandler = async () => {
    if (!deleteTarget) return;
    try {
      const res = await removeSavedForm({ formId: deleteTarget.formId, draftId: deleteTarget.draftId }).unwrap();
      if (res.success) toast.success(res.message || "Draft deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.log("error while deleting draft", error);
      toast.error(error?.data?.message || "Failed to delete draft");
    }
  };
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
      {forms?.length > 0 ? (
        forms?.map((form, index) => {
          const colors = form?.branding?.colors;

          return (
            <div
              key={form?.draftId || form?._id || index}
              className="relative flex h-full w-full min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:border-gray-300 hover:shadow-md md:p-5"
            >
              {/* Header: title block on the left, status on the right */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* truncate + title: long names stay on one line and reveal in full on hover */}
                  <h2
                    title={form?.name}
                    className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg"
                  >
                    {form?.name}
                  </h2>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    Started{" "}
                    {new Date(form?.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <ApplicationStatusBadge status={APPLICATION_STATUS.draft} />
              </div>
              {/* Details - same label/value grid as the submitted card, so both
                  lists line up when they sit together on the page. The section
                  count and the date used to be repeated three and two times. */}
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

              <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <Button
                  label="Delete"
                  className="w-full sm:w-auto"
                  onClick={() => setDeleteTarget({ formId: form?._id, draftId: form?.draftId, name: form?.name })}
                  style={{
                    backgroundColor: colors?.primary,
                    borderColor: colors?.primary,
                    color: colors?.buttonTextPrimary,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                />
                <Button
                  label="Resume"
                  className="w-full sm:w-auto"
                  onClick={() => getSavedData(form?._id, form?.branding?.name, form?.draftId)}
                  style={{
                    backgroundColor: colors?.primary,
                    borderColor: colors?.primary,
                    color: colors?.buttonTextPrimary,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
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
}

export default Draft;

// export default Draft;
