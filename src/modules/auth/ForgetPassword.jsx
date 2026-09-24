import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForgetPasswordMutation } from "@/redux/apis/auth.apis";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import AuthLayout from "./components/AuthLayout";
import { AUTH_ROUTES } from "@/constants";
import { getEmailError } from "./utils/auth.utils";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const emailError = getEmailError(trimmedEmail);
    if (emailError) return setErrors({ email: emailError });

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
    <AuthLayout
      heroTitle="Forgot"
      heroHighlight="Password"
      heroText="Enter the email address associated with your account and we will send you a link to reset your password."
    >
      <h1 className="mb-2 text-2xl font-bold">Reset your password</h1>
      <p className="mb-6 text-sm text-gray-500">We will email you instructions to reset your password.</p>

      <form className="space-y-6" onSubmit={handleSubmit}>
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
          error={errors.email}
          onChange={handleChange}
        />

        <Button disabled={isLoading} loading={isLoading} type="submit" label="Submit" variant="pill" className="w-full" />

        <div className="text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link className="text-textPrimary hover:underline" to={AUTH_ROUTES.LOGIN}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgetPassword;
