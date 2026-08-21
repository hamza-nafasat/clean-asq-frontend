import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import { useResetPasswordMutation } from "@/redux/apis/authApis";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const resetPasswordHandler = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset token is missing. Please open the link from your email.");
      return;
    }

    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      const res = await resetPassword({
        token,
        newPassword,
        confirmNewPassword,
      }).unwrap();
      if (res.success) {
        navigate("/reset-password-successfully");
      }
    } catch (error) {
      console.log("error while resetting password", error);
      toast.error(error?.data?.message || "Error while resetting password");
    }
  };

  return (
    <div className="montserrat-font flex h-screen w-full flex-col items-center justify-center gap-4 bg-white md:flex-row">
      <div className="mt-20 hidden h-full flex-col justify-center md:mt-1 md:flex">
        <h1 className="mb-8 text-4xl font-bold">
          Reset <span className="text-secondary">Password</span>
        </h1>
        <p className="mb-8 max-w-md text-lg font-semibold text-gray-500">
          Choose a strong new password and confirm it to finish resetting your account access.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col justify-center rounded-xl bg-white p-10 shadow-2xl md:w-1/2">
        <h2 className="mb-2 text-2xl font-bold">Create a new password</h2>
        <p className="mb-6 text-sm text-gray-500">Your new password must be different from previous passwords.</p>

        {!token && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            This reset link is missing a token. Please use the link from your email.
          </p>
        )}

        <form className="space-y-6" onSubmit={resetPasswordHandler}>
          <div>
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
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
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
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <Button
            disabled={isLoading || !token}
            loading={isLoading}
            type="submit"
            label="Reset Password"
            className="hover:bg-primary! text-textPrimary border-secondary! w-full rounded-[20px]! border!"
          />

          <div className="text-center text-sm text-gray-500">
            Back to{" "}
            <Link className="text-textPrimary! hover:underline!" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
