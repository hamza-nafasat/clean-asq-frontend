import Button from "@/components/shared/small/Button";
import { useBranding } from "@/hooks/BrandingContext";
import { useGetMyProfileFirstTimeMutation, useLoginMutation } from "@/redux/apis/authApis";
import { userExist, userNotExist } from "@/redux/slices/authSlice";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import TextField from "../../components/shared/small/TextField";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const {
    setName,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextPrimary,
    setButtonTextSecondary,
    setHeaderBackground,
    setFooterBackground,
    setHeaderAlignment,
    setHeaderText,
    setFooterText,
  } = useBranding();

  const getUserAndSetBranding = useCallback(async () => {
    try {
      const res = await getUserProfile().unwrap();
      console.log("res", res);
      if (res?.success) {
        dispatch(userExist(res?.data));
        const formBranding = res?.data?.branding;
        console.log("form branding is ", formBranding);
        console.log("returned branding is applied");
        if (formBranding?.colors) {
          setName(formBranding.name);
          setPrimaryColor(formBranding.colors.primary);
          setSecondaryColor(formBranding.colors.secondary);
          setAccentColor(formBranding.colors.accent);
          setTextColor(formBranding.colors.text);
          setLinkColor(formBranding.colors.link);
          setBackgroundColor(formBranding.colors.background);
          setFrameColor(formBranding.colors.frame);
          setFontFamily(formBranding.fontFamily);
          setLogo(formBranding.selectedLogo);
          setButtonTextPrimary(formBranding.colors.buttonTextPrimary);
          setButtonTextSecondary(formBranding.colors.buttonTextSecondary);
          setHeaderBackground(formBranding.colors.headerBackground);
          setFooterBackground(formBranding.colors.footerBackground);
          setHeaderAlignment(formBranding.headerAlignment);
          setHeaderText(formBranding.colors.headerText);
          setFooterText(formBranding.colors.footerText);
        }
      } else {
        dispatch(userNotExist());
      }
    } catch (err) {
      console.log("error in app.jsx", err);
      dispatch(userNotExist());
    }
  }, [
    getUserProfile,
    dispatch,
    setName,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextPrimary,
    setButtonTextSecondary,
    setHeaderBackground,
    setFooterBackground,
    setHeaderAlignment,
    setHeaderText,
    setFooterText,
  ]);

  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        await getUserAndSetBranding();
      }
    } catch (error) {
      console.log("error while logging in", error);
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
        <p className="mb-8 max-w-md text-lg font-semibold text-gray-500">
          Sign in to your account to manage your giveaways, view analytics, and grow your email list.
        </p>
      </div>

      {/* Right Side */}
      <div className="flex w-full max-w-md flex-col justify-center rounded-xl bg-white p-10 shadow-2xl md:w-1/2">
        <h2 className="mb-2 text-2xl font-bold">Sign in to your account</h2>

        <form className="space-y-6" action="#" method="POST">
          <div>
            <TextField type="email" label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            disabled={isLoading}
            onClick={loginHandler}
            type="submit"
            label="Sign in"
            className="hover:bg-secondary! text-secondary border-secondary! w-full rounded-[20px]! border! bg-blue-600 hover:text-white!"
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
