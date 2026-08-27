import { useBranding } from "@/hooks/BrandingContext";
import { addSavedFormData, setCurrentDraftId, updateEmailVerified } from "@/redux/slices/formSlice";
import { useGetSavedFormMutation, useRemoveSavedFormMutation } from "@/redux/apis/formApis";
import { unwrapResult } from "@reduxjs/toolkit";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import Button from "../shared/small/Button";

function Draft({ forms }) {
  const dispatch = useDispatch();
  const { emailVerified } = useSelector((state) => state.form);
  const navigate = useNavigate();
  const { logo } = useBranding();
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
    <div className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {forms?.length > 0 ? (
        forms?.map((form, index) => {
          const colors = form?.branding?.colors;

          return (
            <div
              key={form?.draftId || form?._id || index}
              className="relative flex min-w-0 flex-col rounded-xl border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6"
            >
              <img
                src={form?.branding?.selectedLogo || logo}
                width={50}
                height={50}
                alt="logo"
                referrerPolicy="no-referrer"
              />

              {/* Menu icon */}
              <div className="absolute top-3 right-3 cursor-pointer sm:top-4 sm:right-4">{/* <CiMenuKebab /> */}</div>
              <div className="flex items-start gap-2 md:gap-4">
                {/* <CardIcon /> */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base leading-tight font-bold wrap-break-word text-gray-700 sm:text-lg md:text-2xl">
                      {form?.name}
                    </h2>
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-500 sm:text-sm">Created from CSV import</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-700 md:mt-3 md:text-base">
                <div className="flex items-center gap-1 md:gap-2">
                  <FaCheck className="text-primary" />
                  <span>{form?.sections?.length} form sections</span>
                </div>{" "}
                <div className="flex items-center gap-1 md:gap-2">
                  <FaCheck className="text-primary" />
                  <span>AI-assisted completion available</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-gray-500">Applicants: {form?.sections?.length}</span>
                <span className="text-gray-500">
                  Created:{" "}
                  {new Date(form?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="mt-3 flex w-full flex-col items-start justify-end gap-3 md:mt-6 md:flex-row md:gap-4">
                <Button
                  label="Delete"
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
