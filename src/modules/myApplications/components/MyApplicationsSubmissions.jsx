import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CgSpinner } from "react-icons/cg";
import { CiMenuKebab } from "react-icons/ci";
import { useGeneratePdfFormMutation } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";
import MyApplicationsSpecialAccessModal from "./MyApplicationsSpecialAccessModal";
import MyApplicationsStatusBadge from "./MyApplicationsStatusBadge";
import { APPLICATION_STATUS } from "@/utils/applicationStatus";
import { PERMISSIONS } from "@/utils/permissions";
import {
  CARD_CLASS,
  MENU_CONTAINER_SELECTOR,
} from "../utils/myApplications.constants";
import {
  buildBrandedButtonStyle,
  dimOnHover,
  formatLongDate,
  getBeneficialOwners,
  undimOnLeave,
} from "../utils/myApplications.utils";

const MyApplicationsSubmissions = ({ forms = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [openSpecialAccessModal, setOpenSpecialAccessModal] = useState(false);
  const [allBeneficials, setAllBeneficials] = useState([]);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [generatePdfForm] = useGeneratePdfFormMutation();
  const canInviteOwner = usePermission(PERMISSIONS.INVITE_OWNER);

  const handleDownload = async (formId, userId) => {
    try {
      setIsLoadingPdf(formId);
      const blob = await generatePdfForm({ _id: formId, userId }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download pdf error:", error);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleForwardBeneficial = (totalOwners) => {
    setOpenSpecialAccessModal(true);
    setAllBeneficials(
      totalOwners?.map((item) => ({
        value: item?.email,
        option: `${item?.name}`,
      })),
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(MENU_CONTAINER_SELECTOR)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {openSpecialAccessModal && (
        <Modal
          title="Forward Beneficial"
          onClose={() => setOpenSpecialAccessModal(false)}
        >
          <MyApplicationsSpecialAccessModal
            allBeneficials={allBeneficials}
            formId={selectedForm}
            setModal={setOpenSpecialAccessModal}
          />
        </Modal>
      )}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {forms?.length > 0 ? (
          forms?.map((form, index) => {
            const colors = form?.branding?.colors;
            const { totalOwners, filledOwners } = getBeneficialOwners(form);
            const isDownloading = isLoadingPdf === form?._id;
            return (
              <div key={index} className={CARD_CLASS}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2
                      title={form?.name}
                      className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg"
                    >
                      {form?.name}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Submitted {formatLongDate(form?.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <MyApplicationsStatusBadge
                      status={APPLICATION_STATUS.submitted}
                    />

                    {canInviteOwner && (
                      <div className="menu-container relative">
                        <button
                          type="button"
                          aria-label="Application actions"
                          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                          onClick={() => {
                            setIsMenuOpen(!isMenuOpen);
                            setSelectedForm(form?._id);
                          }}
                        >
                          <CiMenuKebab />
                        </button>

                        {isMenuOpen && selectedForm === form?._id && (
                          <div className="absolute top-9 right-0 z-10 w-52 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                            <Button
                              type="button"
                              label="Forward Beneficial"
                              variant="icon"
                              className="w-full p-2 text-sm"
                              onClick={() =>
                                handleForwardBeneficial(totalOwners)
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">Sections</dt>
                    <dd className="font-medium text-gray-800">
                      {form?.sections?.length ?? 0}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">Beneficial owners</dt>
                    <dd className="font-medium text-gray-800">
                      {filledOwners?.length ?? 0} of {totalOwners?.length ?? 0}{" "}
                      completed
                    </dd>
                  </div>
                </dl>

                {/* Footer */}
                <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    label="Download PDF"
                    icon={isDownloading && CgSpinner}
                    cnLeft="animate-spin h-5 w-5"
                    disabled={isDownloading}
                    onClick={() => handleDownload(form?._id, user?._id)}
                    className={`w-full sm:w-auto ${isDownloading ? "cursor-not-allowed opacity-30" : ""}`}
                    style={buildBrandedButtonStyle(colors)}
                    onMouseEnter={dimOnHover}
                    onMouseLeave={undimOnLeave}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex items-center justify-center">
            No submissions found
          </div>
        )}
      </div>
    </>
  );
};

export default MyApplicationsSubmissions;
