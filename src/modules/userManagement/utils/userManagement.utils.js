import { LIST_FILTER_TYPES, MODAL_MODES } from "@/constants";
import { matchesOption, matchesText } from "@/utils/listFilter";
import { PROMISE_STATUSES, USER_FILTER_KEYS, USER_FORM_FIELDS } from "./userManagement.constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// returns an error message per field name
export const validateUserForm = (formData, mode) => {
  const errors = {};
  const email = formData[USER_FORM_FIELDS.EMAIL]?.trim();
  const password = formData[USER_FORM_FIELDS.PASSWORD] ?? "";

  if (!formData[USER_FORM_FIELDS.FIRST_NAME]?.trim()) errors[USER_FORM_FIELDS.FIRST_NAME] = "Enter a first name";
  if (!formData[USER_FORM_FIELDS.LAST_NAME]?.trim()) errors[USER_FORM_FIELDS.LAST_NAME] = "Enter a last name";
  if (!email) errors[USER_FORM_FIELDS.EMAIL] = "Enter an email";
  else if (!EMAIL_PATTERN.test(email)) errors[USER_FORM_FIELDS.EMAIL] = "Enter a valid email";
  if (!formData[USER_FORM_FIELDS.ROLE]) errors[USER_FORM_FIELDS.ROLE] = "Choose a role";

  // only new users set a password
  if (mode === MODAL_MODES.ADD) {
    if (!password) errors[USER_FORM_FIELDS.PASSWORD] = "Enter a password";
    else if (password.length < MIN_PASSWORD_LENGTH)
      errors[USER_FORM_FIELDS.PASSWORD] = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  }

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

export const filterUsers = (users, filters) =>
  users.filter(
    (user) =>
      matchesText([getUserFullName(user), user.email], filters[USER_FILTER_KEYS.SEARCH]) &&
      matchesOption(user.role?._id, filters[USER_FILTER_KEYS.ROLE]),
  );

// role options come from the roles list
export const buildUserFilterFields = (roleOptions) => [
  {
    type: LIST_FILTER_TYPES.SEARCH,
    name: USER_FILTER_KEYS.SEARCH,
    label: "User",
    placeholder: "Search by name or email",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: USER_FILTER_KEYS.ROLE,
    label: "Role",
    allLabel: "All roles",
    options: roleOptions,
    className: "sm:col-span-2 lg:col-span-6",
  },
];

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

export const buildUserScreenActions = ({
  users = [],
  createUser,
  updateUser,
  deleteUser,
  sendPasswordResetLink,
  toastError,
}) => ({
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
