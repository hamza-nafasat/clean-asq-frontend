import Button from "@/components/shared/small/Button";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const ResetPasswordSuccessfully = () => {
  const navigate = useNavigate();

  return (
    <div className="montserrat-font flex h-screen w-full flex-col items-center justify-center gap-4 bg-white md:flex-row">
      <div className="mt-20 hidden h-full flex-col justify-center md:mt-1 md:flex">
        <h1 className="mb-8 text-4xl font-bold">
          You&apos;re All <span className="text-secondary">Set</span>
        </h1>
        <p className="mb-8 max-w-md text-lg font-semibold text-gray-500">
          Your password has been updated. You can now sign in with your new credentials and continue managing your
          applications.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-xl bg-white p-10 text-center shadow-2xl md:w-1/2">
        <div className="bg-secondary/10 text-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <HiOutlineCheckCircle className="h-14 w-14" aria-hidden="true" />
        </div>

        <h2 className="mb-2 text-2xl font-bold">Password reset successfully</h2>
        <p className="mb-2 text-sm leading-relaxed text-gray-500">
          Your new password is ready to use. For your security, use this password only on this account.
        </p>
        <p className="mb-8 text-sm leading-relaxed text-gray-500">
          You can now log in with your email and new password to access your dashboard.
        </p>

        <Button
          type="button"
          label="Go to Login"
          onClick={() => navigate("/login")}
          className="hover:bg-primary! text-textPrimary border-secondary! w-full rounded-[20px]! border!"
        />
      </div>
    </div>
  );
};

export default ResetPasswordSuccessfully;
