import { Suspense, lazy, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrandingProvider } from './components/admin/brandings/globalBranding/BrandingContext';
import Verification from './components/applicationVerification/Verification';
import ProtectedRoute from './components/ProtectedRoute';
import CustomLoading from './components/shared/small/CustomLoading';
import { socket } from './main';
import AdminDashboard from './page/admin/dashboard';
import AdminAllUsers from './page/admin/dashboard/admin-dashboard/AdminAllUsers';
import ApplicationForms from './page/admin/dashboard/applicationForms/ApplicationForms';
import Applications from './page/admin/dashboard/applications/Applications';
import AllRoles from './page/admin/dashboard/role/AllRoles';
import UserApplicationForms from './page/admin/userApplicationForms';
import ApplicationForm from './page/admin/userApplicationForms/ApplicationVerification/ApplicationForm';
import SingleApplication from './page/admin/userApplicationForms/ApplicationVerification/SingleApplication';
import CompanyInformation from './page/admin/userApplicationForms/CompanyInformation/CompanyInformation';
import { useGetMyProfileFirstTimeMutation } from './redux/apis/authApis';
import { userExist, userNotExist } from './redux/slices/authSlice';

const Brandings = lazy(() => import('./page/admin/dashboard/brandings/Brandings'));
const CreateBranding = lazy(() => import('./page/admin/dashboard/brandings/CreateBranding'));
const Login = lazy(() => import('./page/auth/Login'));
const Otp = lazy(() => import('./page/auth/Otp'));

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const { user } = useSelector(state => state.auth);

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
        if (res?.data?.success) dispatch(userExist(res.data.data));
        else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()))
      .finally(() => setLoading(false));
  }, [getUserProfile, dispatch]);

  // debugging for socket
  // useEffect(() => {
  //   socket.onAny((event, ...args) => {
  //     console.log(`⚡ Socket event: ${event}`, args);
  //   });
  //   return () => socket.offAny();
  // }, []);
  return (
    <BrowserRouter>
      <BrandingProvider>
        {loading ? (
          <CustomLoading />
        ) : (
          <Suspense fallback={<CustomLoading />}>
            <Routes>
              {/* root redirects */}
              <Route
                path="/"
                element={user ? <Navigate to="/all-users" replace /> : <Navigate to="/login" replace />}
              />

              {/* Public routes */}
              <Route element={<ProtectedRoute user={!user} redirect="/all-users" />}>
                <Route path="/login" element={<Login />} />
                <Route path="/otp" element={<Otp />} />
              </Route>

              {/* Private routes */}
              <Route element={<ProtectedRoute user={user} redirect="/login" />}>
                {/* Admin */}
                <Route path="/" element={<AdminDashboard />}>
                  <Route index element={<Navigate to="all-roles" replace />} />
                  <Route path="all-roles" element={<AllRoles />} />
                  <Route path="all-users" element={<AdminAllUsers />} />
                  <Route path="application-forms" element={<ApplicationForms />} />
                  <Route path="application-form/:formId" element={<SingleApplication />} />
                  <Route path="singleForm/stepper/:formId" element={<ApplicationForm />} />
                  <Route path="applications" element={<Applications />} />
                  <Route path="branding" element={<Brandings />} />
                  <Route path="branding/create" element={<CreateBranding />} />
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
      </BrandingProvider>
      <ToastContainer autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
