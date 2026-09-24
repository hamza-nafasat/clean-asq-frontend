import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetMyProfileFirstTimeMutation, useLoginMutation } from "@/redux/apis/auth.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import { toast } from "react-toastify";
import useAiChat from "@/hooks/useAiChat";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import AuthLayout from "./components/AuthLayout";
import { AUTH_ROUTES } from "@/constants";
import { applyUserBranding } from "@/utils/userBranding";

const Login = () => {
  const dispatch = useDispatch();
  const { clearMessages } = useAiChat();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();

  const getUserAndSetBranding = async () => {
    try {
      const res = await getUserProfile().unwrap();
      if (res?.success) {
        dispatch(userExist(res?.data));
        applyUserBranding(res?.data?.branding, dispatch);
      } else {
        dispatch(userNotExist());
      }
    } catch (error) {
      console.error("Get my profile error:", error);
      dispatch(userNotExist());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        clearMessages();
        await getUserAndSetBranding();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.data?.message || "Error while login");
    }
  };

  return (
    <AuthLayout
      heroTitle="Welcome"
      heroHighlight="Back"
      heroText="Sign in to build application forms, manage branding, review submissions, and keep your onboarding workflows moving."
    >
      <h1 className="mb-2 text-2xl font-bold">Sign in to your account</h1>
      <p className="mb-6 text-sm text-gray-500">
        Enter your email and password to access your dashboard and continue managing applications.
      </p>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <TextField
          borderAndBgChangeIfEmpty={false}
          type="email"
          name="email"
          label="Email address"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          borderAndBgChangeIfEmpty={false}
          type="text"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          isMasked
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right">
          <Link className="text-textPrimary hover:underline" to={AUTH_ROUTES.FORGET_PASSWORD}>
            Forgot Password
          </Link>
        </div>

        <Button disabled={isLoading} loading={isLoading} type="submit" label="Sign in" variant="pill" className="w-full" />
      </form>
    </AuthLayout>
  );
};

export default Login;
