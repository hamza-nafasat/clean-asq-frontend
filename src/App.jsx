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
import ApplicantSubmitPermissionGate from "@/modules/applicant/components/ApplicantSubmitPermissionGate";
import { AUTH_ROUTES, LAYOUT_ROUTES, SOCKET_EVENTS } from "@/constants";
import { PERMISSIONS, getHomePath } from "@/utils/permissions";
import { applyUserBranding } from "@/utils/userBranding";

// auth pages
const Login = lazy(() => import("@/modules/auth/Login"));
const ForgetPassword = lazy(() => import("@/modules/auth/ForgetPassword"));
const ResetPassword = lazy(() => import("@/modules/auth/ResetPassword"));
const ResetMailSent = lazy(() => import("@/modules/auth/ResetMailSent"));
const ResetPasswordSuccessfully = lazy(() => import("@/modules/auth/ResetPasswordSuccessfully"));

// layouts
const AdminDashboard = lazy(() => import("@/components/layouts/DashboardLayout"));

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

  // pick up role changes on return
  useEffect(() => {
    if (!user?._id) return;
    const refreshPermissions = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await getUserProfile().unwrap();
        if (res?.data) dispatch(userExist(res.data));
      } catch (error) {
        console.error("Refresh profile error:", error);
      }
    };
    document.addEventListener("visibilitychange", refreshPermissions);
    return () => document.removeEventListener("visibilitychange", refreshPermissions);
  }, [user?._id, getUserProfile, dispatch]);

  useEffect(() => {
    const userId = user?._id;
    if (!userId) return;
    const register = () => socket.emit(SOCKET_EVENTS.REGISTER_USER, userId);
    // reconnect so the handshake carries the session cookie the server checks
    socket.on(SOCKET_EVENTS.CONNECT, register);
    socket.disconnect().connect();
    return () => socket.off(SOCKET_EVENTS.CONNECT, register);
  }, [user?._id]);

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
            <Route
              path="application-form/:brandingName/:formId"
              element={
                <ApplicantSubmitPermissionGate>
                  <SingleApplication />
                </ApplicantSubmitPermissionGate>
              }
            />
            <Route path="hidden/:formId/:sectionKey" element={<FormHiddenSection />} />
            <Route path="singleForm/owner" element={<AdditionalOwnersForm />} />
            <Route path="submited-successfully/:formId" element={<SubmissionSuccessPage />} />
            <Route
              path="singleform/stepper/:formId"
              element={
                <ApplicantSubmitPermissionGate>
                  <ApplicationForm />
                </ApplicantSubmitPermissionGate>
              }
            />
            <Route
              path="verification"
              element={
                <ApplicantSubmitPermissionGate>
                  <Verification />
                </ApplicantSubmitPermissionGate>
              }
            />
          </Route>

          {/* signed-out routes */}
          <Route element={<ProtectedRoute user={!user} redirect={getHomePath(user)} />}>
            <Route path={AUTH_ROUTES.LOGIN} element={<Login />} />
            <Route path={AUTH_ROUTES.FORGET_PASSWORD} element={<ForgetPassword />} />
            <Route path={AUTH_ROUTES.RESET_MAIL_SENT} element={<ResetMailSent />} />
            <Route path={AUTH_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path={AUTH_ROUTES.RESET_PASSWORD_SUCCESSFULLY} element={<ResetPasswordSuccessfully />} />
          </Route>

          {/* signed-in routes, each page checks its permission */}
          <Route element={<ProtectedRoute user={user} redirect={AUTH_ROUTES.LOGIN} />}>
            <Route path="/" element={<AdminDashboard />}>
              <Route index element={<Navigate to={getHomePath(user)} replace />} />
              <Route path={LAYOUT_ROUTES.MY_APPLICATIONS} element={<DraftSubmission />} />
              <Route path={LAYOUT_ROUTES.MY_PROFILE} element={<MyProfile />} />
              <Route
                path={`${LAYOUT_ROUTES.MANAGE_RULES}/:formId`}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_RULE}>
                    <ManageRules />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.ROLE_MANAGEMENT}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_ROLE}>
                    <AllRoles />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.USER_MANAGEMENT}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_USER}>
                    <UserManagement />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.APPLICATION_FORMS}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_FORM}>
                    <ApplicationForms />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.APPLICATIONS}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_APPLICATION}>
                    <Applications />
                  </RequirePermission>
                }
              />
              <Route
                path={`${LAYOUT_ROUTES.UNDERWRITING}/:applicantId`}
                element={
                  <RequirePermission permission={PERMISSIONS.UNDERWRITING}>
                    <OnBoarding />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.BRANDING}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_BRANDING}>
                    <Brandings />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.BRANDING_CREATE}
                element={
                  <RequirePermission permission={PERMISSIONS.CREATE_BRANDING}>
                    <CreateBranding />
                  </RequirePermission>
                }
              />
              <Route
                path={`${LAYOUT_ROUTES.BRANDING_SINGLE}/:brandingId`}
                element={
                  <RequirePermission permission={PERMISSIONS.UPDATE_BRANDING}>
                    <CreateBranding />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.LOOKUP_MANAGEMENT}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_LOOKUP}>
                    <FormStrategies />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.VERIFICATION_TEST}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_TESTING}>
                    <VerificationTest />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.STRATEGIES}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_STRATEGY}>
                    <Strategies />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.EMAIL}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_EMAIL}>
                    <Email />
                  </RequirePermission>
                }
              />
              <Route
                path={LAYOUT_ROUTES.TESTING}
                element={
                  <RequirePermission permission={PERMISSIONS.READ_TESTING}>
                    <Testing />
                  </RequirePermission>
                }
              />
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
