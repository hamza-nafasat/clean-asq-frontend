import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMailOpen } from "react-icons/hi";
import Button from "@/components/shared/Button";
import { AUTH_ROUTES } from "../utils/auth.constants";
import { getMailboxUrl, maskEmail } from "../utils/auth.utils";

const ResetMailSent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email?.trim() || "";

  const openMailboxHandler = () => {
    const mailboxUrl = getMailboxUrl(email);
    window.open(mailboxUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="montserrat-font flex h-screen w-full flex-col items-center justify-center gap-4 bg-white md:flex-row">
      <div className="mt-20 hidden h-full flex-col justify-center md:mt-1 md:flex">
        <h1 className="mb-8 text-4xl font-bold">
          Check Your <span className="text-secondary">Inbox</span>
        </h1>
        <p className="mb-8 max-w-md text-lg font-semibold text-gray-500">
          We have sent a password reset link to your email. Open your mailbox, click the link, and set a new password.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-xl bg-white p-10 text-center shadow-2xl md:w-1/2">
        <div className="bg-secondary/10 text-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <HiOutlineMailOpen className="h-12 w-12" aria-hidden="true" />
        </div>

        <h2 className="mb-2 text-2xl font-bold">Mail sent successfully</h2>
        <p className="mb-2 text-sm leading-relaxed text-gray-500">
          {email ? (
            <>
              We sent a password reset link to{" "}
              <span className="text-textPrimary font-semibold">{maskEmail(email)}</span>.
            </>
          ) : (
            <>We sent a password reset link to your email address.</>
          )}
        </p>
        <p className="mb-8 text-sm leading-relaxed text-gray-500">
          Open your mailbox, find the email from us, and click the reset link to create a new password.
        </p>

        <div className="flex w-full flex-col gap-3">
          <Button
            type="button"
            label="Open Mailbox"
            onClick={openMailboxHandler}
            className="hover:bg-primary! text-textPrimary border-secondary! w-full rounded-[20px]! border!"
          />

          <Button
            type="button"
            variant="secondary"
            label="Back to Forgot Password"
            onClick={() => navigate(AUTH_ROUTES.FORGET_PASSWORD)}
            className="w-full rounded-[20px]!"
          />

          <div className="mt-2 text-sm text-gray-500">
            Already reset?{" "}
            <Link className="text-textPrimary! hover:underline!" to={AUTH_ROUTES.LOGIN}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetMailSent;
