import { Suspense, lazy, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import CustomLoading from './components/shared/small/CustomLoading';
import { BrandingProvider } from './components/admin/brandings/globalBranding/BrandingContext';
import AdminDashboard from './page/admin/dashboard';
import AdminApplicants from './page/admin/dashboard/admin-applicants/AdminApplicants';
import AdminApplications from './page/admin/dashboard/admin-applications/AdminApplications';
import AdminAllUsers from './page/admin/dashboard/admin-dashboard/AdminAllUsers';
import AllRoles from './page/admin/dashboard/role/AllRoles';
import UserApplicationForms from './page/admin/userApplicationForms';
import ApplicationVerification from './page/admin/userApplicationForms/ApplicationVerification/ApplicationVerification';
import CompanyInformation from './page/admin/userApplicationForms/CompanyInformation/CompanyInformation';
import { useGetMyProfileFirstTimeMutation } from './redux/apis/authApis';
import { userExist, userNotExist } from './redux/slices/authSlice';

const Brandings = lazy(() => import('./page/admin/dashboard/brandings/Brandings'));
const Login = lazy(() => import('./page/auth/Login'));
const Otp = lazy(() => import('./page/auth/Otp'));
function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    getUserProfile()
      .then(res => {
        if (res?.data?.success) dispatch(userExist(res.data.data));
        else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()))
      .finally(() => setLoading(false));
  }, [getUserProfile, dispatch]);

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
                element={user ? <Navigate to="/all-roles" replace /> : <Navigate to="/login" replace />}
              />

              {/* Public routes */}
              <Route element={<ProtectedRoute user={!user} redirect="/all-roles" />}>
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
                  <Route path="admin-applications" element={<AdminApplications />} />
                  <Route path="admin-applicants" element={<AdminApplicants />} />
                  <Route path="branding" element={<Brandings />} />
                </Route>

                {/*all User Forms or application layout  , with out sidebar */}
                <Route path="/user-application-forms" element={<UserApplicationForms />}>
                  <Route index element={<Navigate to="application-verification" replace />} />
                  <Route path="application-verification" element={<ApplicationVerification />} />
                  <Route path="company-information" element={<CompanyInformation />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<RoleRedirect user={user} />} />
            </Routes>
          </Suspense>
        )}
      </BrandingProvider>
      <ToastContainer autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
