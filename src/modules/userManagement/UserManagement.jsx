import { useForgetPasswordMutation } from "@/redux/apis/auth.apis";
import { useGetAllRolesQuery } from "@/redux/apis/roleManagement.apis";
import {
  useCreateUserMutation,
  useDeleteSingleUserMutation,
  useGetAllUsersQuery,
  useUpdateSingleUserMutation,
} from "@/redux/apis/userManagement.apis";
import { toast } from "react-toastify";
import useListFilter from "@/hooks/useListFilter";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import ListFilter from "@/components/global/ListFilter";
import UserManagementHeading from "./components/UserManagementHeading";
import UserManagementTable from "./components/UserManagementTable";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import { INITIAL_USER_FILTERS, USER_AI_CHAT_PATH, USER_SCREEN_CONTEXT } from "./utils/userManagement.constants";
import {
  buildUserFilterFields,
  buildUserScreenActions,
  buildUserScreenState,
  filterUsers,
} from "./utils/userManagement.utils";

const SERVER_URL = getEnv("SERVER_URL");

const UserManagement = () => {
  const { data: users, isLoading: isLoadingUsers, isError, refetch } = useGetAllUsersQuery();
  const canReadRole = usePermission(PERMISSIONS.READ_ROLE);
  const { data: roles, isLoading: isLoadingRoles } = useGetAllRolesQuery(undefined, { skip: !canReadRole });
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateSingleUserMutation();
  const [deleteUser] = useDeleteSingleUserMutation();
  const [sendPasswordResetLink] = useForgetPasswordMutation();

  const userRows = users?.data ?? [];
  const roleRows = roles?.data ?? [];
  const roleOptions = roleRows.map((role) => ({ value: role._id, label: role.name }));
  const { filters, handleChange, clearFilters, hasActiveFilters } = useListFilter(INITIAL_USER_FILTERS);
  const filteredUsers = filterUsers(userRows, filters);

  useScreenContext({
    ...USER_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${USER_AI_CHAT_PATH}`,
    currentState: buildUserScreenState(userRows, roleRows),
    actions: buildUserScreenActions({
      users: userRows,
      createUser,
      updateUser,
      deleteUser,
      sendPasswordResetLink,
      toastError: toast.error,
    }),
  });

  return (
    <article className="mt-5" data-testid="users-page">
      <UserManagementHeading roleOptions={roleOptions} />
      <ListFilter
        className="mb-5"
        fields={buildUserFilterFields(roleOptions)}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={handleChange}
        onClear={clearFilters}
      />
      <UserManagementTable
        users={filteredUsers}
        isFiltered={hasActiveFilters}
        roleOptions={roleOptions}
        isLoading={isLoadingUsers || isLoadingRoles}
        isError={isError}
        onRetry={refetch}
      />
    </article>
  );
};

export default UserManagement;
