import { MODAL_MODES } from "@/constants";
import { PROMISE_STATUSES } from "./userManagement.constants";

// returns an error message per field name
export const validateUserForm = (formData, mode) => {
  const errors = {};

  // TODO(human): fill errors for the add and edit form

  return errors;
};

export const formatDateAndTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getUserFullName = (user) => `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

const runUserAction = async (request, fallbackMessage, toastError) => {
  try {
    const res = await request();
    if (!res?.success) throw new Error(res?.message);
  } catch (err) {
    toastError(err?.data?.message || err?.message || fallbackMessage);
    throw err;
  }
};

export const buildUserScreenState = (users = [], roles = []) => ({
  users: users.map((u) => ({
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: { _id: u.role?._id, name: u.role?.name },
    createdAt: u.createdAt?.split("T")[0],
    lastActive: u.lastActive?.split("T")[0] || null,
  })),
  availableRoles: roles.map((r) => ({ _id: r._id, name: r.name })),
});

export const buildUserScreenActions = ({ users = [], createUser, updateUser, deleteUser, sendPasswordResetLink, toastError }) => ({
  createUser: ({ firstName, lastName, email, roleId, password }) =>
    runUserAction(
      () => createUser({ firstName, lastName, email, role: roleId, password }).unwrap(),
      "Failed to create user",
      toastError,
    ),
  updateUser: ({ userId, firstName, lastName, email, roleId }) =>
    runUserAction(
      () => {
        const payload = { _id: userId };
        if (firstName) payload.firstName = firstName;
        if (lastName) payload.lastName = lastName;
        if (email) payload.email = email;
        if (roleId) payload.role = roleId;
        return updateUser(payload).unwrap();
      },
      "Failed to update user",
      toastError,
    ),
  sendPasswordResetLinks: async ({ userIds }) => {
    const emails = users.filter((user) => userIds?.includes(user?._id)).map((user) => user?.email);
    const results = await Promise.allSettled(emails.map((email) => sendPasswordResetLink({ email }).unwrap()));
    const failedCount =
      results.filter((result) => result.status === PROMISE_STATUSES.REJECTED).length +
      (userIds?.length || 0) -
      emails.length;
    if (failedCount) {
      toastError(`Failed to send ${failedCount} of ${userIds?.length || 0} password reset links`);
      throw new Error(`Failed to send ${failedCount} password reset links`);
    }
  },
  deleteUser: ({ userId }) =>
    runUserAction(() => deleteUser({ _id: userId }).unwrap(), "Failed to delete user", toastError),
  deleteUsers: async ({ userIds }) => {
    const errors = [];
    for (const userId of userIds) {
      try {
        await deleteUser({ _id: userId }).unwrap();
      } catch {
        errors.push(userId);
      }
    }
    if (errors.length) {
      toastError(`Failed to delete ${errors.length} of ${userIds.length} users`);
      throw new Error(`Failed to delete ${errors.length} users`);
    }
  },
});
