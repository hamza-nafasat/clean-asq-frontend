import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetDefaultBrandingQuery } from "@/redux/apis/branding.apis";
import { FORM_BRANDING_PATHS } from "@/constants";
import { applyUserBranding } from "@/utils/userBranding";

const isFormBrandingPage = (pathname) =>
  FORM_BRANDING_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const useDefaultBranding = (user) => {
  const dispatch = useDispatch();
  const { data } = useGetDefaultBrandingQuery(undefined, { skip: !user?._id || Boolean(user?.branding) });
  const defaultBranding = data?.data;

  useEffect(() => {
    // form pages keep the form's branding
    if (!defaultBranding || isFormBrandingPage(window.location.pathname.toLowerCase())) return;
    applyUserBranding(defaultBranding, dispatch);
  }, [defaultBranding, dispatch]);
};

export default useDefaultBranding;
