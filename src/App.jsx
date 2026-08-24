import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DemoSessionProvider } from "./hooks/DemoSessionContext";
import { useBranding } from "./hooks/BrandingContext";
import { socket } from "./main";
import { useGetMyProfileFirstTimeMutation } from "./redux/apis/authApis";
import { userExist, userNotExist } from "./redux/slices/authSlice";
import { detectVPN } from "./utils/vpnDetection";

import ProtectedRoute from "./components/ProtectedRoute";
import CustomLoading from "./components/shared/small/CustomLoading";
// Auth pages

const Login = lazy(() => import("./page/auth/Login"));
const Otp = lazy(() => import("./page/auth/Otp"));
const ForgetPassword = lazy(() => import("./page/auth/ForgetPassword"));
const ResetPassword = lazy(() => import("./page/auth/ResetPassword"));
const ResetMailSent = lazy(() => import("./page/auth/ResetMailSent"));
const ResetPasswordSuccessfully = lazy(() => import("./page/auth/ResetPasswordSuccessfully"));

// Layouts
const AdminDashboard = lazy(() => import("./page/admin/dashboard"));
const UserApplicationForms = lazy(() => import("./page/admin/userApplicationForms"));

// Public / shared application routes
const SingleApplication = lazy(
  () => import("./page/admin/userApplicationForms/ApplicationVerification/SingleApplication"),
);
const FormHiddenSection = lazy(() => import("./page/admin/userApplicationForms/Hidden/HIdden"));
const ManageRules = lazy(() => import("./components/admin/ManageRules"));
const AdditionalOwnersForm = lazy(
  () => import("./page/admin/userApplicationForms/ApplicationVerification/AdditionalOwnersForm"),
);
const SubmissionSuccessPage = lazy(() =>
  import("./components/LoadingWithTimerAfterSubmission").then((module) => ({
    default: module.SubmissionSuccessPage,
  })),
);
const ApplicationForm = lazy(() => import("./page/admin/userApplicationForms/ApplicationVerification/ApplicationForm"));
const ApplicationPdfView = lazy(
  () => import("./page/admin/userApplicationForms/ApplicationVerification/ApplicationPdfView"),
);
const Verification = lazy(() => import("./page/admin/dashboard/varification/Varification"));
const DraftSubmission = lazy(() => import("./page/admin/dashboard/draftSubmission/DraftSubmission"));

// Authenticated admin routes
const AllRoles = lazy(() => import("./page/admin/dashboard/role/AllRoles"));
const AdminAllUsers = lazy(() => import("./page/admin/dashboard/admin-dashboard/AdminAllUsers"));
const ApplicationForms = lazy(() => import("./page/admin/dashboard/applicationForms/ApplicationForms"));
const Applications = lazy(() => import("./page/admin/dashboard/applications/Applications"));
const OnBoarding = lazy(() => import("./page/admin/dashboard/underwriting/underwriting"));
const Brandings = lazy(() => import("./page/admin/dashboard/brandings/Brandings"));
const CreateBranding = lazy(() => import("./page/admin/dashboard/brandings/CreateBranding"));
const FormStrategies = lazy(() => import("./page/admin/dashboard/formStrategies/FormStrategies"));
const VerificationTest = lazy(() => import("./page/admin/dashboard/varification/VerficationTest"));
const Strategies = lazy(() => import("./page/admin/dashboard/strategies/Strategies"));
const Email = lazy(() => import("./page/admin/dashboard/email/Email"));
const MyProfile = lazy(() => import("./page/admin/dashboard/myProfile/MyProfile"));
const RoleRedirect = lazy(() => import("./components/RoleRedirect"));

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [getUserProfile, { isLoading }] = useGetMyProfileFirstTimeMutation();
  const { user } = useSelector((state) => state.auth);
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
    setHeaderAlignment,
    setHeaderBackground,
    setFooterBackground,
    setHeaderText,
    setFooterText,
    setApplicationFooterText,
    setAppLogoMaxWidth,
    setAppLogoMaxHeight,
  } = useBranding();

  const getUserAndSetBranding = useCallback(async () => {
    try {
      const res = await getUserProfile().unwrap();
      if (res?.success) {
        dispatch(userExist(res?.data));
        const formBranding = res?.data?.branding;
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
          setApplicationFooterText(formBranding.applicationFooterText);
          setAppLogoMaxWidth(formBranding.appLogoMaxWidth);
          setAppLogoMaxHeight(formBranding.appLogoMaxHeight);
        }
      } else {
        dispatch(userNotExist());
      }
    } catch (err) {
      console.log("error in app.jsx", err);
      dispatch(userNotExist());
    } finally {
      setLoading(false);
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
    setApplicationFooterText,
    setAppLogoMaxWidth,
    setAppLogoMaxHeight,
  ]);

  useEffect(() => {
    getUserAndSetBranding();
  }, [getUserAndSetBranding]);

  useEffect(() => {
    const userId = user?._id;
    if (!userId) return;
    const register = () => {
      socket.emit("register_user", userId);
      console.log(`📌 User registered: ${userId} -> ${socket.id}`);
    };
    if (socket.connected) register();
    else socket.on("connect", register);
    return () => socket.off("connect", register);
  }, [user?._id]);

  useEffect(() => {
    // async function checkClientVpn() {

    // const vpnData = await detectVPN();
    // const resp = await fetch(`${getEnv("SERVER_URL")}/api/form/vpn-check`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ vpnData }),
    // });
    // const result = await resp.json();
    // console.log("VPN result:", result);
    // }
    // checkClientVpn();
    detectVPN();
  }, []);

  const isGuest = user?.role?.name === "guest";
  if (loading || isLoading) return <CustomLoading />;
  return (
    <DemoSessionProvider>
      <>
        <Suspense fallback={<CustomLoading />}>
          <Routes>
            {/* root redirects */}
            <Route
              path="/"
              element={user ? <Navigate to="/application-forms" replace /> : <Navigate to="/login" replace />}
            />
            <Route path="singleform/pdf-view/:pdfId/:userId" element={<ApplicationPdfView />} />
            {/* public routes */}
            <Route path="/" element={<AdminDashboard />}>
              <Route path="application-form/:brandingName/:formId" element={<SingleApplication />} />
              <Route path="hidden/:formId/:sectionKey" element={<FormHiddenSection />} />
              <Route path="singleForm/owner" element={<AdditionalOwnersForm />} />
              <Route path="submited-successfully/:formId" element={<SubmissionSuccessPage />} />
              <Route path="singleform/stepper/:formId" element={<ApplicationForm />} />
              <Route path="verification" element={<Verification />} />
              <Route path="submission" element={<DraftSubmission />} />
              <Route path="my-profile" element={<MyProfile />} />
            </Route>
            {/* non authentic routes */}
            <Route element={<ProtectedRoute user={!user} redirect={isGuest ? "/submission" : "/application-forms"} />}>
              <Route path="/login" element={<Login />} />
              <Route path="/otp" element={<Otp />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/reset-mail-sent" element={<ResetMailSent />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-successfully" element={<ResetPasswordSuccessfully />} />
            </Route>

            {/* authentic routes admin only */}
            <Route
              element={<ProtectedRoute user={!isGuest && user} redirect={isGuest && user ? "/submission" : "/login"} />}
            >
              {/* Admin */}
              <Route path="/" element={<AdminDashboard />}>
                <Route index element={<Navigate to="application-forms" replace />} />
                {/* HIDDEN FORM SECTION */}
                <Route path="manage-rules/:formId" element={<ManageRules />} />
                <Route path="all-roles" element={<AllRoles />} />
                <Route path="all-users" element={<AdminAllUsers />} />
                <Route path="application-forms" element={<ApplicationForms />} />
                <Route path="applications" element={<Applications />} />
                <Route path="underwriting/:applicantId" element={<OnBoarding />} />
                <Route path="branding" element={<Brandings />} />
                <Route path="branding/create" element={<CreateBranding />} />
                <Route path="branding/single/:brandingId" element={<CreateBranding />} />
                <Route path="strategies-key" element={<FormStrategies />} />
                <Route path="verification-test" element={<VerificationTest />} />
                <Route path="strategies" element={<Strategies />} />
                <Route path="email" element={<Email />} />
              </Route>

              {/*all User Forms or application layout  , with out sidebar */}
              <Route path="/user-application-forms" element={<UserApplicationForms />}>
                <Route index element={<Navigate to="application-verification" replace />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RoleRedirect user={user} />} />
          </Routes>
        </Suspense>
        <ToastContainer autoClose={3000} />
      </>
    </DemoSessionProvider>
  );
}

export default App;
