import { useState } from "react";
import { toast } from "react-toastify";
import {
  useGetSingleFormQueryQuery,
  useGetSingleSubmitFormQueryQuery,
  useGiveSpecialAccessToUserMutation,
} from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";
import CustomizableSelect from "@/components/shared/CustomizableSelect";
import TextField from "@/components/shared/TextField";
import { getForwardableSections, getFullName } from "../utils/applications.utils";

const ApplicationsSpecialAccessModal = ({ formId = null, setModal, submittedFormId = null }) => {
  // this application's applicant, not every applicant of the form
  const { data: submission } = useGetSingleSubmitFormQueryQuery({ _id: submittedFormId }, { skip: !submittedFormId });
  const [giveSpecialAccessToUser, { isLoading: isGivingSpecialAccess }] = useGiveSpecialAccessToUserMutation();
  const { data: formData } = useGetSingleFormQueryQuery({ _id: formId });
  const [form, setForm] = useState({ email: "", sectionKey: "" });

  const specialSections = getForwardableSections(formData?.data).map((section) => ({
    option: section?.name,
    value: section?.key,
  }));

  const applicant = submission?.data?.user;
  const selectedUsers = applicant?.email ? [{ option: getFullName(applicant), value: applicant.email }] : [];

  const handleGiveSpecialAccess = async () => {
    try {
      if (!form?.email || !form?.sectionKey) return toast.error("Please select a user and section");
      if (!submittedFormId) return toast.error("Form ID is required");
      const res = await giveSpecialAccessToUser({
        formId: formId,
        submittedFormId: submittedFormId,
        email: form?.email,
        sectionKey: form?.sectionKey,
      }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || "Form forwarded successfully");
        setModal?.(false);
        setForm({ userId: "", sectionKey: "" });
      }
    } catch (error) {
      console.error("Forward form error:", error);
      toast.error(error?.data?.message || "Failed to forward a form to user");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-100 p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Heading */}
        <h3 className="text-center text-lg font-semibold text-gray-800">Forward a form </h3>

        <div className="flex flex-col gap-2">
          <CustomizableSelect
            options={selectedUsers}
            value={form?.email}
            onSelect={(value) => setForm((prev) => ({ ...prev, email: value }))}
            label={"Select User"}
            defaultText="Select User"
          />
          <span className="text-sm text-gray-500">or type email manually</span>
          <TextField
            name="email"
            placeholder="Enter email"
            value={form?.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <CustomizableSelect
            options={specialSections}
            onSelect={(value) => setForm((prev) => ({ ...prev, sectionKey: value }))}
            label={"Select Section"}
            defaultText="Select Section"
          />
        </div>

        {/* Actions */}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal?.(false)} />
          <Button
            disabled={isGivingSpecialAccess}
            label="Send Form"
            variant="primary"
            className={`${isGivingSpecialAccess ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={handleGiveSpecialAccess}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationsSpecialAccessModal;
