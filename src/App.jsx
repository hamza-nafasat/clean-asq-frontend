import { Suspense, lazy, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SubmissionSuccessPage } from './components/LoadingWithTimerAfterSubmission';
import ProtectedRoute from './components/ProtectedRoute';
import CustomLoading from './components/shared/small/CustomLoading';
import { useBranding } from './hooks/BrandingContext';
import { socket } from './main';
import AdminDashboard from './page/admin/dashboard';
import AdminAllUsers from './page/admin/dashboard/admin-dashboard/AdminAllUsers';
import ApplicationForms from './page/admin/dashboard/applicationForms/ApplicationForms';
import Applications from './page/admin/dashboard/applications/Applications';
import FormStrategies from './page/admin/dashboard/formStrategies/FormStrategies';
import AllRoles from './page/admin/dashboard/role/AllRoles';
import Strategies from './page/admin/dashboard/strategies/Strategies';
import Verification from './page/admin/dashboard/varification/Varification';
import UserApplicationForms from './page/admin/userApplicationForms';
import AdditionalOwnersForm from './page/admin/userApplicationForms/ApplicationVerification/AdditionalOwnersForm';
import ApplicationForm from './page/admin/userApplicationForms/ApplicationVerification/ApplicationForm';
import SingleApplication from './page/admin/userApplicationForms/ApplicationVerification/SingleApplication';
import CompanyInformation from './page/admin/userApplicationForms/CompanyInformation/CompanyInformation';
import { useGetMyProfileFirstTimeMutation } from './redux/apis/authApis';
import { userExist, userNotExist } from './redux/slices/authSlice';
import VerificationTest from './page/admin/dashboard/varification/VerficationTest';
import { detectVPN } from './utils/vpnDetection';
import getEnv from './lib/env';

const Brandings = lazy(() => import('./page/admin/dashboard/brandings/Brandings'));
const CreateBranding = lazy(() => import('./page/admin/dashboard/brandings/CreateBranding'));
const Login = lazy(() => import('./page/auth/Login'));
const Otp = lazy(() => import('./page/auth/Otp'));

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const { user } = useSelector(state => state.auth);

  const {
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextColor,
  } = useBranding();

  useEffect(() => {
    const userId = user?._id;
    if (!userId) return;
    const register = () => {
      socket.emit('register_user', userId);
      console.log(`📌 User registered: ${userId} -> ${socket.id}`);
    };
    if (socket.connected) register();
    else socket.on('connect', register);
    return () => socket.off('connect', register);
  }, [user?._id]);

  useEffect(() => {
    getUserProfile()
      .then(res => {
        if (res?.data?.success) {
          dispatch(userExist(res.data.data));
          console.log(res?.data?.data?.branding);
          if (res?.data?.data?.branding?.colors) {
            const userBranding = res?.data?.data?.branding;
            if (userBranding?.colors) {
              setPrimaryColor(userBranding.colors.primary);
              setSecondaryColor(userBranding.colors.secondary);
              setAccentColor(userBranding.colors.accent);
              setTextColor(userBranding.colors.text);
              setLinkColor(userBranding.colors.link);
              setBackgroundColor(userBranding.colors.background);
              setFrameColor(userBranding.colors.frame);
              setFontFamily(userBranding.fontFamily);
              setLogo(userBranding?.selectedLogo);
              setButtonTextColor(userBranding.colors.buttonText);
            }
          }
        } else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()))
      .finally(() => setLoading(false));
  }, [
    getUserProfile,
    dispatch,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextColor,
  ]);

  useEffect(() => {
    async function checkClientVpn() {
      const vpnData = await detectVPN();

      const resp = await fetch(`${getEnv('SERVER_URL')}/api/form/vpn-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vpnData }),
      });
      const result = await resp.json();
      console.log('VPN result:', result);
    }
    checkClientVpn();
  }, []);
  return (
    <>
      {loading ? (
        <CustomLoading />
      ) : (
        <Suspense fallback={<CustomLoading />}>
          <Routes>
            {/* root redirects */}
            <Route path="/" element={user ? <Navigate to="/all-users" replace /> : <Navigate to="/login" replace />} />
            {/* public routes */}
            <Route path="/" element={<AdminDashboard />}>
              <Route path="application-form/:formId" element={<SingleApplication />} />
              <Route path="singleForm/owner" element={<AdditionalOwnersForm />} />
              <Route path="submited-successfully/:formId" element={<SubmissionSuccessPage />} />
            </Route>
            {/* non authentic routes */}
            <Route element={<ProtectedRoute user={!user} redirect="/all-users" />}>
              <Route path="/login" element={<Login />} />
              <Route path="/otp" element={<Otp />} />
            </Route>

            {/* authentic routes */}
            <Route element={<ProtectedRoute user={user} redirect="/login" />}>
              {/* Admin */}
              <Route path="/" element={<AdminDashboard />}>
                <Route index element={<Navigate to="all-roles" replace />} />
                <Route path="all-roles" element={<AllRoles />} />
                <Route path="all-users" element={<AdminAllUsers />} />
                <Route path="application-forms" element={<ApplicationForms />} />
                <Route path="singleform/stepper/:formId" element={<ApplicationForm />} />
                <Route path="applications" element={<Applications />} />
                <Route path="branding" element={<Brandings />} />
                <Route path="branding/create" element={<CreateBranding />} />
                <Route path="branding/single/:brandingId" element={<CreateBranding />} />
                <Route path="strategies-key" element={<FormStrategies />} />
                {/* <Route path="extraction-context" element={<ExtractionContext />} /> */}
                <Route path="verification" element={<Verification />} />
                <Route path="verification-test" element={<VerificationTest />} />
                <Route path="strategies" element={<Strategies />} />
              </Route>

              {/*all User Forms or application layout  , with out sidebar */}
              <Route path="/user-application-forms" element={<UserApplicationForms />}>
                <Route index element={<Navigate to="application-verification" replace />} />
                <Route path="company-information" element={<CompanyInformation />} />
              </Route>
            </Route>

            {/* Fallback */}
            {/* <Route path="*" element={<RoleRedirect user={user} />} /> */}
          </Routes>
        </Suspense>
      )}
      <ToastContainer autoClose={3000} />
    </>
  );
}

export default App;
