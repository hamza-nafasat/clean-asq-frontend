// App.js
import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import CustomLoading from './components/shared/small/CustomLoading';

import AdminDashboard from './page/admin/dashboard';
import AdminApplicants from './page/admin/dashboard/admin-applicants/AdminApplicants';
import AdminApplications from './page/admin/dashboard/admin-applications/AdminApplications';
import AdminAllUsers from './page/admin/dashboard/admin-dashboard/AdminAllUsers';
import AllRoles from './page/admin/dashboard/role/AllRoles';
import UserApplicationForms from './page/admin/userApplicationForms';
import ApplicationVerification from './page/admin/userApplicationForms/ApplicationVerification/ApplicationVerification';
import CompanyInformation from './page/admin/userApplicationForms/CompanyInformation/CompanyInformation';
import ClientMemberDashboard from './page/client-member/dashboard';
import ClientMemberApplications from './page/client-member/dashboard/client-member-applications/ClientMemberApplications';
import TeamMemberDashboard from './page/team-member/dashboard';
import TeamMemberApplication from './page/team-member/dashboard/team-member-applications/TeamMemberApplication';

import { userExist, userNotExist } from './redux/slices/authSlice';
import { useGetMyProfileFirstTimeMutation } from './redux/apis/authApis';
import { BrandingProvider } from './components/admin/brandings/globalBranding/BrandingContext';

// Lazy components
const Brandings = lazy(() => import('./page/admin/dashboard/brandings/Brandings'));
const Login = lazy(() => import('./page/auth/Login'));
const Otp = lazy(() => import('./page/auth/Otp'));
const ApplicantsDashboard = lazy(() => import('./page/applicants/dashboard'));
const ApplicantsApplications = lazy(
  () => import('./page/applicants/dashboard/applicants-applications/ApplicantsApplications')
);
const ClientDashboard = lazy(() => import('./page/client/dashboard'));
const ClientApplications = lazy(() => import('./page/client/dashboard/client-applications/ClientApplications'));
const SuperBankDashboard = lazy(() => import('./page/superBank/dashboard'));
const SuperBankApplications = lazy(
  () => import('./page/superBank/dashboard/super-Bank-applications/SuperBankApplications')
);

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

                {/* User Forms */}
                <Route path="/user-application-forms" element={<UserApplicationForms />}>
                  <Route index element={<Navigate to="application-verification" replace />} />
                  <Route path="application-verification" element={<ApplicationVerification />} />
                  <Route path="company-information" element={<CompanyInformation />} />
                </Route>

                {/* Applicants */}
                <Route path="/applicants" element={<ApplicantsDashboard />}>
                  <Route index element={<Navigate to="applicants-applications" replace />} />
                  <Route path="applicants-applications" element={<ApplicantsApplications />} />
                </Route>

                {/* Clients */}
                <Route path="/client" element={<ClientDashboard />}>
                  <Route index element={<Navigate to="client-applications" replace />} />
                  <Route path="client-applications" element={<ClientApplications />} />
                </Route>

                {/* Client Members */}
                <Route path="/client_mbr" element={<ClientMemberDashboard />}>
                  <Route index element={<Navigate to="client_mbr-applications" replace />} />
                  <Route path="client_mbr-applications" element={<ClientMemberApplications />} />
                </Route>

                {/* Team Members */}
                <Route path="/team-mbr" element={<TeamMemberDashboard />}>
                  <Route index element={<Navigate to="team-mbr-applications" replace />} />
                  <Route path="team-mbr-applications" element={<TeamMemberApplication />} />
                </Route>

                {/* Super Bank */}
                <Route path="/super-bank" element={<SuperBankDashboard />}>
                  <Route index element={<Navigate to="super-bank-applications" replace />} />
                  <Route path="super-bank-applications" element={<SuperBankApplications />} />
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
