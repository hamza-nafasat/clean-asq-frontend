import { useState } from "react";
import { toast } from "react-toastify";
import { useUpdateMyPasswordMutation } from "@/redux/apis/auth.apis";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { EMPTY_PASSWORD_FORM } from "../utils/myProfile.constants";

const MyProfilePasswordForm = () => {
  const [updateMyPassword, { isLoading: isUpdatingPassword }] = useUpdateMyPasswordMutation();
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const isPasswordFormFilled = Boolean(
    passwordForm.currentPassword.trim() && passwordForm.newPassword.trim() && passwordForm.confirmNewPassword.trim(),
  );

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!isPasswordFormFilled) return;

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      const res = await updateMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      }).unwrap();
      if (res.success) {
        setPasswordForm(EMPTY_PASSWORD_FORM);
        toast.success(res.message || "Password updated successfully");
      }
    } catch (error) {
      console.error("Update password error:", error);
      toast.error(error?.data?.message || "Error while updating password");
    }
  };

  return (
    <form
      onSubmit={handleUpdatePassword}
      className="mt-6 overflow-hidden rounded-2xl border border-[#E8EEF5] bg-white shadow-sm"
    >
      <div className="space-y-6 px-6 py-8 sm:px-8">
        <div>
          <h3 className="text-textPrimary text-lg font-semibold">Change Password</h3>
          <p className="mt-1 text-sm text-gray-500">Update your password. All three fields are required.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TextField
            borderAndBgChangeIfEmpty={false}
            type="text"
            name="currentPassword"
            label="Current Password"
            placeholder="Enter current password"
            autoComplete="current-password"
            required
            isMasked
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            borderAndBgChangeIfEmpty={false}
            type="text"
            name="newPassword"
            label="New Password"
            placeholder="Enter new password"
            autoComplete="new-password"
            required
            isMasked
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
          />
          <TextField
            borderAndBgChangeIfEmpty={false}
            type="text"
            name="confirmNewPassword"
            label="Confirm New Password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            isMasked
            value={passwordForm.confirmNewPassword}
            onChange={handlePasswordChange}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            label="Update Password"
            loading={isUpdatingPassword}
            disabled={!isPasswordFormFilled || isUpdatingPassword}
            className="rounded-[12px]! px-6!"
          />
        </div>
      </div>
    </form>
  );
};

export default MyProfilePasswordForm;
