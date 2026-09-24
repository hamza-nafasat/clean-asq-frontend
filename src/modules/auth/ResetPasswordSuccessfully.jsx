import { useNavigate } from "react-router-dom";
import { HiOutlineCheckCircle } from "react-icons/hi";
import Button from "@/components/shared/Button";
import AuthLayout from "./components/AuthLayout";
import { AUTH_ROUTES } from "@/constants";

const ResetPasswordSuccessfully = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      heroTitle="You're All"
      heroHighlight="Set"
      heroText="Your password has been updated. You can now sign in with your new credentials and continue managing your applications."
      className="items-center text-center"
    >
      <div className="bg-secondary/10 text-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <HiOutlineCheckCircle className="h-14 w-14" aria-hidden="true" />
      </div>

      <h1 className="mb-2 text-2xl font-bold">Password reset successfully</h1>
      <p className="mb-2 text-sm leading-relaxed text-gray-500">
        Your new password is ready to use. For your security, use this password only on this account.
      </p>
      <p className="mb-8 text-sm leading-relaxed text-gray-500">
        You can now log in with your email and new password to access your dashboard.
      </p>

      <Button
        type="button"
        label="Go to Login"
        onClick={() => navigate(AUTH_ROUTES.LOGIN)}
        variant="pill"
        className="w-full"
      />
    </AuthLayout>
  );
};

export default ResetPasswordSuccessfully;
