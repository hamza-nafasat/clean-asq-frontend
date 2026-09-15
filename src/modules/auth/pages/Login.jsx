import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation, useLoginMutation } from "@/redux/apis/auth.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import useAiChat from "@/hooks/useAiChat";
import useBranding from "@/hooks/useBranding";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { AUTH_ROUTES } from "../utils/auth.constants";
import { applyUserBranding } from "../utils/auth.utils";

const Login = () => {
  const dispatch = useDispatch();
  const { clearMessages } = useAiChat();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const brandingSetters = useBranding();

  const getUserAndSetBranding = async () => {
    try {
      const res = await getUserProfile().unwrap();
      if (res?.success) {
        dispatch(userExist(res?.data));
        applyUserBranding(res?.data?.branding, brandingSetters);
      } else {
        dispatch(userNotExist());
      }
    } catch (error) {
      console.error("Get my profile error:", error);
      dispatch(userNotExist());
    }
  };

  const loginHandler = async (e) => {
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
    <div className="montserrat-font flex h-screen w-full flex-col items-center justify-center gap-4 bg-white md:flex-row">
      {/* Left Side */}
      <div className="mt-20 hidden h-full flex-col justify-center md:mt-1 md:flex">
        <h1 className="mb-8 text-4xl font-bold">
          Welcome <span className="text-secondary">Back</span>
        </h1>
        <p className="mb-4 max-w-md text-lg font-semibold text-gray-500">
          Sign in to build application forms, manage branding, review submissions, and keep your onboarding workflows
          moving.
        </p>
      </div>

      {/* Right Side */}
      <div className="flex w-full max-w-md flex-col justify-center rounded-xl bg-white p-10 shadow-2xl md:w-1/2">
        <h2 className="mb-2 text-2xl font-bold">Sign in to your account</h2>
        <p className="mb-6 text-sm text-gray-500">
          Enter your email and password to access your dashboard and continue managing applications.
        </p>

        <form className="space-y-3" onSubmit={loginHandler}>
          <div>
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
          </div>
          <div>
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
          </div>
          <div className="text-right">
            <Link className="text-textPrimary! hover:underline!" to={AUTH_ROUTES.FORGET_PASSWORD}>
              Forgot Password
            </Link>
          </div>

          <Button
            disabled={isLoading}
            type="submit"
            label="Sign in"
            className="hover:bg-primary! text-textPrimary border-secondary! w-full rounded-[20px]! border!"
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
