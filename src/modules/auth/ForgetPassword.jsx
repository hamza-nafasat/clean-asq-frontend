import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForgetPasswordMutation } from "@/redux/apis/auth.apis";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { AUTH_ROUTES } from "./utils/auth.constants";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();

  const forgetPasswordHandler = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const res = await forgetPassword({ email: trimmedEmail }).unwrap();
      if (res.success) {
        navigate(AUTH_ROUTES.RESET_MAIL_SENT, { state: { email: trimmedEmail } });
      }
    } catch (error) {
      console.error("Forget password error:", error);
      toast.error(error?.data?.message || "Error while requesting password reset");
    }
  };

  return (
    <div className="montserrat-font flex h-screen w-full flex-col items-center justify-center gap-4 bg-white md:flex-row">
      <div className="mt-20 hidden h-full flex-col justify-center md:mt-1 md:flex">
        <h1 className="mb-8 text-4xl font-bold">
          Forgot <span className="text-secondary">Password</span>
        </h1>
        <p className="mb-8 max-w-md text-lg font-semibold text-gray-500">
          Enter the email address associated with your account and we will send you a link to reset your password.
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col justify-center rounded-xl bg-white p-10 shadow-2xl md:w-1/2">
        <h2 className="mb-2 text-2xl font-bold">Reset your password</h2>
        <p className="mb-6 text-sm text-gray-500">We will email you instructions to reset your password.</p>

        <form className="space-y-6" onSubmit={forgetPasswordHandler}>
          <div>
            <TextField
              borderAndBgChangeIfEmpty={false}
              type="email"
              name="email"
              id="email"
              label="Email address"
              placeholder="Enter your email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            disabled={isLoading}
            loading={isLoading}
            type="submit"
            label="Submit"
            className="hover:bg-primary! text-textPrimary border-secondary! w-full rounded-[20px]! border!"
          />

          <div className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link className="text-textPrimary! hover:underline!" to={AUTH_ROUTES.LOGIN}>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
