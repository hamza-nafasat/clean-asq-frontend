import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPasswordHandler = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: call reset-password API when available
      navigate("/reset-password-successfully");
    } catch (error) {
      console.log("error while resetting password", error);
      toast.error(error?.data?.message || "Error while resetting password");
    } finally {
      setIsSubmitting(false);
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
              minLength={8}
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
              minLength={8}
              required
              isMasked
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          <Button
            disabled={isSubmitting}
            loading={isSubmitting}
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
