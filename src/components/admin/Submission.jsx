import ApplicationStatusBadge from "@/components/shared/small/ApplicationStatusBadge";
import { APPLICATION_STATUS } from "@/lib/applicationStatus";
import {
  useApplicantGiveSpecialAccessToBeneficialOwnerMutation,
  useGeneratePdfFormMutation,
} from "@/redux/apis/formApis";
import { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { CiMenuKebab } from "react-icons/ci";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "../shared/small/Button";
import CustomizableSelect from "../shared/small/CustomizeableSelect";
import Modal from "../shared/small/Modal";
import TextField from "../shared/small/TextField";
import { formFieldsStaticKeys, formKeys } from "@/data/constants";

function Submission({ forms }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [openSpecialAccessModal, setOpenSpecialAccessModal] = useState(false);
  const [allBeneficials, setAllBeneficials] = useState([]);

  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [generatePdfForm] = useGeneratePdfFormMutation();

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
    } catch (err) {
      console.log("PDF download failed", err);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".menu-container")) {
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
        <Modal title="Forward Beneficial" onClose={() => setOpenSpecialAccessModal(false)}>
          <SpecialAccessModal
            allBeneficials={allBeneficials}
            formId={selectedForm}
            setModal={setOpenSpecialAccessModal}
          />
        </Modal>
      )}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {forms?.length > 0 ? (
          forms?.map((form, index) => {
            console.log("form", form);
            const colors = form?.branding?.colors;
            const additionalOwnerKey = Object.keys(form?.submitData?.[formKeys.beneficial_owners_key])?.find(
              (key) =>
                form?.submitData?.[formKeys.beneficial_owners_key]?.[key]?.name ==
                formFieldsStaticKeys.additional_owners_key,
            );
            const totalBeneficialOwners = form?.submitData?.[formKeys.beneficial_owners_key]?.[
              additionalOwnerKey
            ]?.value?.filter((item) => item?.email);
            const filledBeneficialOwners = totalBeneficialOwners?.filter((item) => item?.isCompleted);
            return (
              <div
                key={index}
                className="relative flex h-full w-full min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:border-gray-300 hover:shadow-md md:p-5"
              >
                {/* Header: title block on the left, status + menu on the right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* truncate + title: long names stay on one line and reveal in full on hover */}
                    <h2
                      title={form?.name}
                      className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg"
                    >
                      {form?.name}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Submitted{" "}
                      {new Date(form?.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <ApplicationStatusBadge status={APPLICATION_STATUS.submitted} />

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
                            label="Forward Beneficial"
                            variant="icon"
                            className="w-full p-2 text-sm"
                            onClick={() => {
                              setOpenSpecialAccessModal(true);
                              const beneficialMailsAndNames = totalBeneficialOwners?.map((item) => ({
                                value: item?.email,
                                option: `${item?.name}`,
                              }));
                              setAllBeneficials(beneficialMailsAndNames);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details - a label/value grid keeps values aligned across cards */}
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">Sections</dt>
                    <dd className="font-medium text-gray-800">{form?.sections?.length ?? 0}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">Beneficial owners</dt>
                    <dd className="font-medium text-gray-800">
                      {filledBeneficialOwners?.length ?? 0} of {totalBeneficialOwners?.length ?? 0} completed
                    </dd>
                  </div>
                </dl>

                {/* Footer - mt-auto pins the buttons to the bottom so every card
                    in the grid lines its actions up, whatever the content height */}
                <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    label="Download PDF"
                    icon={isLoadingPdf === form?._id && CgSpinner}
                    cnLeft={`animate-spin h-5 w-5`}
                    disabled={isLoadingPdf === form?._id}
                    onClick={() => handleDownload(form?._id, user?._id)}
                    className={`w-full sm:w-auto ${isLoadingPdf === form?._id ? "cursor-not-allowed opacity-30" : ""}`}
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
          <div className="col-span-full flex items-center justify-center">No submissions found</div>
        )}
      </div>
    </>
  );
}

export default Submission;

const SpecialAccessModal = ({ allBeneficials, formId, setModal }) => {
  const [giveSpecialAccessToUser, { isLoading: isGivingSpecialAccess }] =
    useApplicantGiveSpecialAccessToBeneficialOwnerMutation();
  const [form, setForm] = useState({
    email: "",
  });

  const giveSpecialAccessToUserHandler = async () => {
    try {
      if (!form?.email) return toast.error("selection or email is required");
      if (!formId) return toast.error("Form ID is required");
      const res = await giveSpecialAccessToUser({
        formId: formId,
        email: form?.email,
      }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || "Special access sent successfully");
        setForm({ email: "" });
        setModal(false);
      }
    } catch (error) {
      console.error("Error giving special access to user:", error);
      toast.error(error?.data?.message || "Failed to forwarding a form to user");
    }
  };

  return (
    <div className="flex items-center justify-center p-4 ">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Heading */}
        <h3 className="text-center text-lg font-semibold text-gray-800">Forward a form to Beneficial Owners</h3>

        <div className="flex flex-col gap-2">
          <CustomizableSelect
            options={allBeneficials}
            onSelect={(value) => setForm((prev) => ({ ...prev, email: value }))}
            label={"Select User"}
            defaultText="Select Beneficial Owner"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-500">or type email manually</span>
          <TextField
            name="email"
            placeholder="Enter email"
            value={form?.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal(false)} />
          <Button
            disabled={isGivingSpecialAccess}
            label="Send Form"
            variant="primary"
            className={`${isGivingSpecialAccess ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={giveSpecialAccessToUserHandler}
          />
        </div>
      </div>
    </div>
  );
};
