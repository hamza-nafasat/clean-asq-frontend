import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMailOpen } from "react-icons/hi";
import Button from "@/components/shared/Button";
import AuthLayout from "./components/AuthLayout";
import { AUTH_ROUTES } from "@/constants";
import { getMailboxUrl, maskEmail } from "./utils/auth.utils";

const ResetMailSent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email?.trim() || "";

  const handleOpenMailbox = () => {
    window.open(getMailboxUrl(email), "_blank", "noopener,noreferrer");
  };

  return (
    <AuthLayout
      heroTitle="Check Your"
      heroHighlight="Inbox"
      heroText="We have sent a password reset link to your email. Open your mailbox, click the link, and set a new password."
      className="items-center text-center"
    >
      <div className="bg-secondary/10 text-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <HiOutlineMailOpen className="h-12 w-12" aria-hidden="true" />
      </div>

      <h1 className="mb-2 text-2xl font-bold">Mail sent successfully</h1>
      <p className="mb-2 text-sm leading-relaxed text-gray-500">
        {email ? (
          <>
            We sent a password reset link to <span className="text-textPrimary font-semibold">{maskEmail(email)}</span>.
          </>
        ) : (
          "We sent a password reset link to your email address."
        )}
      </p>
      <p className="mb-8 text-sm leading-relaxed text-gray-500">
        Open your mailbox, find the email from us, and click the reset link to create a new password.
      </p>

      <div className="flex w-full flex-col gap-3">
        <Button type="button" label="Open Mailbox" onClick={handleOpenMailbox} variant="pill" className="w-full" />

        <Button
          type="button"
          variant="secondary"
          label="Back to Forgot Password"
          onClick={() => navigate(AUTH_ROUTES.FORGET_PASSWORD)}
          className="w-full rounded-[20px]!"
        />

        <div className="mt-2 text-sm text-gray-500">
          Already reset?{" "}
          <Link className="text-textPrimary hover:underline" to={AUTH_ROUTES.LOGIN}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetMailSent;
