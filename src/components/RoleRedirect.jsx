import { Navigate } from 'react-router-dom';

const roleRouteMap = {
  admin: '/all-roles',
  applicant: '/applicants/applicants-applications',
  client: '/client/client-applications',
  client_mbr: '/client_mbr/client_mbr-applications',
  team_mbr: '/team-mbr/team-mbr-applications',
  super_bank: '/super-bank/super-bank-applications',
};
const RoleRedirect = ({ user }) => {
  if (!user?.isAuthenticated || !user.role || !roleRouteMap[user.role]) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={roleRouteMap[user.role]} replace />;
};
export default RoleRedirect;
// admin
// applicant
// client
// client-mbr
// team-mbr
// super-bank
