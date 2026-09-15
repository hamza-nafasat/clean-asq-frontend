import { useState } from "react";
import { toast } from "react-toastify";
import { useApplicantGiveSpecialAccessToBeneficialOwnerMutation } from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";
import CustomizableSelect from "@/components/shared/CustomizableSelect";
import TextField from "@/components/shared/TextField";
import { EMPTY_SPECIAL_ACCESS_FORM } from "../utils/my-applications.constants";

const MyApplicationsSpecialAccessModal = ({ allBeneficials = [], formId, setModal }) => {
  const [giveSpecialAccessToUser, { isLoading: isGivingSpecialAccess }] =
    useApplicantGiveSpecialAccessToBeneficialOwnerMutation();
  const [form, setForm] = useState(EMPTY_SPECIAL_ACCESS_FORM);

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
        setForm(EMPTY_SPECIAL_ACCESS_FORM);
        setModal?.(false);
      }
    } catch (error) {
      console.error("Give special access error:", error);
      toast.error(error?.data?.message || "Failed to forwarding a form to user");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h3 className="text-center text-lg font-semibold text-gray-800">Forward a form to Beneficial Owners</h3>

        <div className="flex flex-col gap-2">
          <CustomizableSelect
            options={allBeneficials}
            onSelect={(value) => setForm((prev) => ({ ...prev, email: value }))}
            label="Select User"
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

        {/* Actions */}
        <div className="flex w-full justify-end gap-2">
          <Button type="button" label="Cancel" variant="secondary" onClick={() => setModal?.(false)} />
          <Button
            type="button"
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

export default MyApplicationsSpecialAccessModal;
