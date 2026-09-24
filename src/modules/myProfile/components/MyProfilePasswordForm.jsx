import { useState } from "react";
import { toast } from "react-toastify";
import { useUpdateMyPasswordMutation } from "@/redux/apis/auth.apis";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { EMPTY_PASSWORD_FORM, PASSWORD_FIELDS } from "../utils/myProfile.constants";
import { validatePasswordForm } from "../utils/myProfile.utils";

const MyProfilePasswordForm = () => {
  const [updateMyPassword, { isLoading: isUpdatingPassword }] = useUpdateMyPasswordMutation();
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [errors, setErrors] = useState({});
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);

  const isPasswordFormFilled = Boolean(
    passwordForm.currentPassword.trim() && passwordForm.newPassword.trim() && passwordForm.confirmNewPassword.trim(),
  );

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPasswordFormFilled) return;
    const validationErrors = validatePasswordForm(passwordForm);
    if (Object.keys(validationErrors).length) return setErrors(validationErrors);
    setIsConfirmingUpdate(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      const res = await updateMyPassword(passwordForm).unwrap();
      setPasswordForm(EMPTY_PASSWORD_FORM);
      toast.success(res.message);
    } catch (error) {
      console.error("Update password error:", error);
      toast.error(error?.data?.message || "Error while updating password");
    } finally {
      setIsConfirmingUpdate(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="border-cardBorder mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <div className="space-y-6 px-6 py-8 sm:px-8">
          <header>
            <h2 className="text-textPrimary text-lg font-semibold">Change Password</h2>
            <p className="mt-1 text-sm text-gray-500">Update your password. All three fields are required.</p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TextField
              borderAndBgChangeIfEmpty={false}
              type="text"
              name={PASSWORD_FIELDS.CURRENT_PASSWORD}
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
              name={PASSWORD_FIELDS.NEW_PASSWORD}
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
              name={PASSWORD_FIELDS.CONFIRM_NEW_PASSWORD}
              label="Confirm New Password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
              isMasked
              value={passwordForm.confirmNewPassword}
              onChange={handlePasswordChange}
              error={errors.confirmNewPassword}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              label="Update Password"
              loading={isUpdatingPassword}
              disabled={!isPasswordFormFilled || isUpdatingPassword}
              size="lg"
            />
          </div>
        </div>
      </form>

      <ConfirmationModal
        isOpen={isConfirmingUpdate}
        onClose={() => setIsConfirmingUpdate(false)}
        onConfirm={handleConfirmUpdate}
        title="Change Password"
        message="Are you sure you want to change your password? You will be signed out on your other devices."
        isLoading={isUpdatingPassword}
        confirmButtonText="Update Password"
      />
    </>
  );
};

export default MyProfilePasswordForm;
