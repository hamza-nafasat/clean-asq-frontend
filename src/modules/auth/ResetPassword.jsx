import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useResetPasswordMutation } from "@/redux/apis/auth.apis";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import AuthLayout from "./components/AuthLayout";
import { AUTH_ROUTES } from "@/constants";
import { RESET_TOKEN_PARAM } from "./utils/auth.constants";
import { getConfirmPasswordError, getNewPasswordError } from "./utils/auth.utils";

const initialPasswords = { newPassword: "", confirmNewPassword: "" };

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get(RESET_TOKEN_PARAM) || "";
  const [passwords, setPasswords] = useState(initialPasswords);
  const [errors, setErrors] = useState({});
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset token is missing. Please open the link from your email.");
      return;
    }

    const nextErrors = {
      newPassword: getNewPasswordError(passwords.newPassword),
      confirmNewPassword: getConfirmPasswordError(passwords),
    };
    if (nextErrors.newPassword || nextErrors.confirmNewPassword) return setErrors(nextErrors);

    try {
      const res = await resetPassword({ token, ...passwords }).unwrap();
      if (res.success) {
        navigate(AUTH_ROUTES.RESET_PASSWORD_SUCCESSFULLY);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error?.data?.message || "Error while resetting password");
    }
  };

  return (
    <AuthLayout
      heroTitle="Reset"
      heroHighlight="Password"
      heroText="Choose a strong new password and confirm it to finish resetting your account access."
    >
      <h1 className="mb-2 text-2xl font-bold">Create a new password</h1>
      <p className="mb-6 text-sm text-gray-500">Your new password must be different from previous passwords.</p>

      {!token && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          This reset link is missing a token. Please use the link from your email.
        </p>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <TextField
          borderAndBgChangeIfEmpty={false}
          type="text"
          name="newPassword"
          id="newPassword"
          label="New Password"
          placeholder="Enter new password"
          autoComplete="new-password"
          required
          isMasked
          value={passwords.newPassword}
          error={errors.newPassword}
          onChange={handleChange}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          type="text"
          name="confirmNewPassword"
          id="confirmNewPassword"
          label="Confirm New Password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          required
          isMasked
          value={passwords.confirmNewPassword}
          error={errors.confirmNewPassword}
          onChange={handleChange}
        />

        <Button
          disabled={isLoading || !token}
          loading={isLoading}
          type="submit"
          label="Reset Password"
          variant="pill"
          className="w-full"
        />

        <div className="text-center text-sm text-gray-500">
          Back to{" "}
          <Link className="text-textPrimary hover:underline" to={AUTH_ROUTES.LOGIN}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
