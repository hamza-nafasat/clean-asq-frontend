import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import { socket } from "@/lib/socket";
import useBrandingSync from "@/hooks/useBrandingSync";
import CustomLoading from "@/components/shared/CustomLoading";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RequirePermission from "@/routes/RequirePermission";
import { AUTH_ROUTES, LAYOUT_ROUTES, SOCKET_EVENTS } from "@/constants";
import { PERMISSIONS, getHomePath, isGuestRole } from "@/utils/permissions";
import { applyUserBranding } from "@/utils/userBranding";

// auth pages
const Login = lazy(() => import("@/modules/auth/Login"));
const ForgetPassword = lazy(() => import("@/modules/auth/ForgetPassword"));
const ResetPassword = lazy(() => import("@/modules/auth/ResetPassword"));
const ResetMailSent = lazy(() => import("@/modules/auth/ResetMailSent"));
const ResetPasswordSuccessfully = lazy(() => import("@/modules/auth/ResetPasswordSuccessfully"));

// layouts
const AdminDashboard = lazy(() => import("@/components/layouts/DashboardLayout"));
const UserApplicationForms = lazy(() => import("@/components/layouts/ApplicationFormLayout"));

// public and shared application pages
const SingleApplication = lazy(() => import("@/modules/applicant/SingleApplication"));
const FormHiddenSection = lazy(() => import("@/modules/applicant/HiddenSection"));
const ManageRules = lazy(() => import("@/modules/applicationForms/ManageRules"));
const AdditionalOwnersForm = lazy(() => import("@/modules/applicant/AdditionalOwnersForm"));
const SubmissionSuccessPage = lazy(() =>
  import("@/modules/applicant/SubmissionSuccess").then((module) => ({
    default: module.SubmissionSuccessPage,
  })),
);
const ApplicationForm = lazy(() => import("@/modules/applicant/ApplicationForm"));
const ApplicationPdfView = lazy(() => import("@/components/global/ApplicationPdfView"));
const Verification = lazy(() => import("@/modules/applicant/CompanyVerification"));
const DraftSubmission = lazy(() => import("@/modules/myApplications/MyApplications"));

// signed-in dashboard pages
const AllRoles = lazy(() => import("@/modules/roleManagement/RoleManagement"));
const UserManagement = lazy(() => import("@/modules/userManagement/UserManagement"));
const ApplicationForms = lazy(() => import("@/modules/applicationForms/ApplicationForms"));
const Applications = lazy(() => import("@/modules/applications/Applications"));
const OnBoarding = lazy(() => import("@/modules/underwriting/Underwriting"));
const Brandings = lazy(() => import("@/modules/branding/Brandings"));
const CreateBranding = lazy(() => import("@/modules/branding/CreateBranding"));
const FormStrategies = lazy(() => import("@/modules/lookupManagement/LookupManagement"));
const VerificationTest = lazy(() => import("@/modules/testing/VerificationTest"));
const Strategies = lazy(() => import("@/modules/strategies/Strategies"));
const Email = lazy(() => import("@/modules/email/Email"));
const Testing = lazy(() => import("@/modules/testing/Testing"));
const MyProfile = lazy(() => import("@/modules/myProfile/MyProfile"));
const RoleRedirect = lazy(() => import("@/routes/RoleRedirect"));

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [getUserProfile, { isLoading }] = useGetMyProfileFirstTimeMutation();
  const { user } = useSelector((state) => state.auth);
  useBrandingSync();

  const getUserAndSetBranding = useCallback(async () => {
    try {
      const res = await getUserProfile().unwrap();
      if (res?.success) {
        dispatch(userExist(res?.data));
        applyUserBranding(res?.data?.branding, dispatch);
      } else {
        dispatch(userNotExist());
      }
    } catch (error) {
      console.error("Get profile error:", error);
      dispatch(userNotExist());
    } finally {
      setLoading(false);
    }
  }, [getUserProfile, dispatch]);

  useEffect(() => {
    getUserAndSetBranding();
  }, [getUserAndSetBranding]);

  useEffect(() => {
    const userId = user?._id;
    if (!userId) return;
    const register = () => socket.emit(SOCKET_EVENTS.REGISTER_USER, userId);
    // reconnect so the handshake carries the session cookie the server checks
    socket.on(SOCKET_EVENTS.CONNECT, register);
    socket.disconnect().connect();
    return () => socket.off(SOCKET_EVENTS.CONNECT, register);
  }, [user?._id]);

  const isGuest = isGuestRole(user);
  if (loading || isLoading) return <CustomLoading />;
  return (
    <>
      <Suspense fallback={<CustomLoading />}>
        <Routes>
          {/* root redirects */}
          <Route
            path="/"
            element={user ? <Navigate to={getHomePath(user)} replace /> : <Navigate to={AUTH_ROUTES.LOGIN} replace />}
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

          {/* signed-out routes */}
          <Route element={<ProtectedRoute user={!user} redirect={getHomePath(user)} />}>
            <Route path={AUTH_ROUTES.LOGIN} element={<Login />} />
            <Route path={AUTH_ROUTES.FORGET_PASSWORD} element={<ForgetPassword />} />
            <Route path={AUTH_ROUTES.RESET_MAIL_SENT} element={<ResetMailSent />} />
            <Route path={AUTH_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path={AUTH_ROUTES.RESET_PASSWORD_SUCCESSFULLY} element={<ResetPasswordSuccessfully />} />
          </Route>

          {/* signed-in routes without guests */}
          <Route element={<ProtectedRoute user={!isGuest && user} redirect={isGuest && user ? LAYOUT_ROUTES.MY_APPLICATIONS : AUTH_ROUTES.LOGIN} />}>
            <Route path="/" element={<AdminDashboard />}>
              <Route index element={<Navigate to={getHomePath(user)} replace />} />
              <Route
                path="manage-rules/:formId"
                element={
                  <RequirePermission permission={PERMISSIONS.UNDERWRITING}>
                    <ManageRules />
                  </RequirePermission>
                }
              />
              <Route
                path="all-roles"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_ROLE}>
                    <AllRoles />
                  </RequirePermission>
                }
              />
              <Route
                path="all-users"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_USER}>
                    <UserManagement />
                  </RequirePermission>
                }
              />
              <Route
                path="application-forms"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_FORM}>
                    <ApplicationForms />
                  </RequirePermission>
                }
              />
              <Route
                path="applications"
                element={
                  <RequirePermission permission={PERMISSIONS.UNDERWRITING}>
                    <Applications />
                  </RequirePermission>
                }
              />
              <Route
                path="underwriting/:applicantId"
                element={
                  <RequirePermission permission={PERMISSIONS.UNDERWRITING}>
                    <OnBoarding />
                  </RequirePermission>
                }
              />
              <Route
                path="branding"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_BRANDING}>
                    <Brandings />
                  </RequirePermission>
                }
              />
              <Route
                path="branding/create"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_BRANDING}>
                    <CreateBranding />
                  </RequirePermission>
                }
              />
              <Route
                path="branding/single/:brandingId"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_BRANDING}>
                    <CreateBranding />
                  </RequirePermission>
                }
              />
              <Route
                path="strategies-key"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_STRATEGY}>
                    <FormStrategies />
                  </RequirePermission>
                }
              />
              <Route
                path="verification-test"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_TESTING}>
                    <VerificationTest />
                  </RequirePermission>
                }
              />
              <Route
                path="strategies"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_STRATEGY}>
                    <Strategies />
                  </RequirePermission>
                }
              />
              <Route
                path="email"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_EMAIL}>
                    <Email />
                  </RequirePermission>
                }
              />
              <Route
                path="testing"
                element={
                  <RequirePermission permission={PERMISSIONS.READ_TESTING}>
                    <Testing />
                  </RequirePermission>
                }
              />
            </Route>

            {/* application layout without the sidebar */}
            <Route path="/user-application-forms" element={<UserApplicationForms />}>
              <Route index element={<Navigate to="application-verification" replace />} />
            </Route>
          </Route>

          {/* fallback */}
          <Route path="*" element={<RoleRedirect user={user} />} />
        </Routes>
      </Suspense>
      <ToastContainer autoClose={3000} />
    </>
  );
};

export default App;
