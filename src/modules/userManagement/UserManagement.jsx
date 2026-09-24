import { useForgetPasswordMutation } from "@/redux/apis/auth.apis";
import { useGetAllRolesQuery } from "@/redux/apis/roleManagement.apis";
import {
  useCreateUserMutation,
  useDeleteSingleUserMutation,
  useGetAllUsersQuery,
  useUpdateSingleUserMutation,
} from "@/redux/apis/userManagement.apis";
import { toast } from "react-toastify";
import { useScreenContext } from "@/hooks/useScreenContext";
import UserManagementHeading from "./components/UserManagementHeading";
import UserManagementTable from "./components/UserManagementTable";
import getEnv from "@/utils/env";
import { USER_AI_CHAT_PATH, USER_SCREEN_CONTEXT } from "./utils/userManagement.constants";
import { buildUserScreenActions, buildUserScreenState } from "./utils/userManagement.utils";

const SERVER_URL = getEnv("SERVER_URL");

const UserManagement = () => {
  const { data: users, isLoading: isLoadingUsers, isError, refetch } = useGetAllUsersQuery();
  const { data: roles, isLoading: isLoadingRoles } = useGetAllRolesQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateSingleUserMutation();
  const [deleteUser] = useDeleteSingleUserMutation();
  const [sendPasswordResetLink] = useForgetPasswordMutation();

  const userRows = users?.data ?? [];
  const roleRows = roles?.data ?? [];
  const roleOptions = roleRows.map((role) => ({ value: role._id, label: role.name }));

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
    deps: { userCount: userRows.length, roleCount: roleRows.length },
  });

  return (
    <article className="mt-5" data-testid="users-page">
      <UserManagementHeading roleOptions={roleOptions} />
      <UserManagementTable
        users={userRows}
        roleOptions={roleOptions}
        isLoading={isLoadingUsers || isLoadingRoles}
        isError={isError}
        onRetry={refetch}
      />
    </article>
  );
};

export default UserManagement;
