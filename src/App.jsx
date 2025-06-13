import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import CustomLoading from './components/shared/small/CustomLoading';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import AdminDashboard from './page/admin/dashboard';
// import AdminApplications from './page/admin/dashboard/admin-dashboard/AdminAllUsers';
import ClientMemberApplications from './page/client-member/dashboard/client-member-applications/ClientMemberApplications';
import ClientMemberDashboard from './page/client-member/dashboard';
import TeamMemberDashboard from './page/team-member/dashboard';
import TeamMemberApplication from './page/team-member/dashboard/team-member-applications/TeamMemberApplication';
import AdminAllUsers from './page/admin/dashboard/admin-dashboard/AdminAllUsers';
import AdminApplications from './page/admin/dashboard/admin-applications/AdminApplications';
import AdminApplicants from './page/admin/dashboard/admin-applicants/AdminApplicants';
import AllRoles from './page/admin/dashboard/role/AllRoles';
import ApplicationVerification from './page/admin/userApplicationForms/ApplicationVerification/ApplicationVerification';
import UserApplicationForms from './page/admin/userApplicationForms';
import CompanyInformation from './page/admin/userApplicationForms/CompanyInforation/CompanyInformation';

const Brandings =lazy(()=>import('./page/admin/dashboard/brandings/Brandings'))
// Lazy components
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

const user = {
  isAuthenticated: true, // true or false
  role: 'admin', // try null, undefined, or wrong role to test role are (applicant, client, client_mbr,team_mbr, super_bank)
};
const userForm = {
  isAuthenticated: true, // true or false
  role: 'form', // try null, undefined, or wrong role to test role are (applicant, client, client_mbr,team_mbr, super_bank)
};

function App() {
  return (
    <Suspense fallback={<CustomLoading />}>
      <Routes>
        {/* Public Routes (unauthenticated only) */}
        {!user?.isAuthenticated && <Route path="/" element={<Login />} />}
        {!user?.isAuthenticated && <Route path="/otp" element={<Otp />} />}

        {/* Authenticated users trying to access public routes */}
        {user?.isAuthenticated && <Route path="/" element={<RoleRedirect user={user} />} />}
        {user?.isAuthenticated && <Route path="/otp" element={<RoleRedirect user={user} />} />}

        <Route
          path="/*"
          element={
            <ProtectedRoute user={user} role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="all-roles" element={<AllRoles />} />
          <Route path="all-users" element={<AdminAllUsers />} />
          <Route path="admin-applications" element={<AdminApplications />} />
          <Route path="admin-applicants" element={<AdminApplicants />} />
          <Route path="branding" element={<Brandings />} />
        </Route>
        <Route
          path="/user-application-forms/*"
          element={
            <ProtectedRoute user={user} role="admin">
              <UserApplicationForms />
            </ProtectedRoute>
          }
        >
          <Route path="application-verification" element={<ApplicationVerification />} />
          <Route path="company-information" element={<CompanyInformation />} />
        </Route>
        <Route
          path="/applicants/*"
          element={
            <ProtectedRoute user={user} role="applicant">
              <ApplicantsDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="applicants-applications" element={<ApplicantsApplications />} />
        </Route>

        <Route
          path="/client/*"
          element={
            <ProtectedRoute user={user} role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="client-applications" element={<ClientApplications />} />
        </Route>

        <Route
          path="/client_mbr/*"
          element={
            <ProtectedRoute user={user} role="client_mbr">
              <ClientMemberDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="client_mbr-applications" element={<ClientMemberApplications />} />
        </Route>
        <Route
          path="/team-mbr/*"
          element={
            <ProtectedRoute user={user} role="team_mbr">
              <TeamMemberDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="team-mbr-applications" element={<TeamMemberApplication />} />
        </Route>

        <Route
          path="/super-bank/*"
          element={
            <ProtectedRoute user={user} role="super_bank">
              <SuperBankDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="super-bank-applications" element={<SuperBankApplications />} />
        </Route>

        <Route path="*" element={<RoleRedirect user={user} />} />
      </Routes>
    </Suspense>
  );
}

export default App;
