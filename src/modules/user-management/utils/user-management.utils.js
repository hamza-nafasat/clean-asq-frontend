import { FIELD_TYPES } from "@/constants";
import {
  BUSINESS_USER_TYPES,
  PASSWORD_REQUIREMENTS,
  PROMISE_STATUSES,
  USER_FORM_FIELDS,
  USER_TYPES,
} from "./user-management.constants";

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUserForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Invalid email format";
  }

  if (!formData.type) {
    errors.type = "Account type is required";
  } else if (!Object.values(USER_TYPES).includes(formData.type)) {
    errors.type = "Invalid account type";
  }

  // business name for business user types
  if (BUSINESS_USER_TYPES.includes(formData.type) && !formData.businessName?.trim()) {
    errors.businessName = "Business name is required for this account type";
  }

  // password required for new users
  if (!formData.id && !formData.password) {
    errors.password = "Password is required for new users";
  } else if (formData.password) {
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors;
    }
  }

  // admin access setting for team members
  if (formData.type === USER_TYPES.TEAM_MEMBER && typeof formData.allowAdminAccess !== "boolean") {
    errors.allowAdminAccess = "Invalid admin access setting";
  }

  return errors;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formateDateAndTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getFieldLabel = (field) =>
  field
    .split(/(?=[A-Z])/)
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());

export const applyUserFormChange = (prev, { name, value, type, checked }) => ({
  ...prev,
  [name]: type === FIELD_TYPES.CHECKBOX ? checked : value,
  ...(name === USER_FORM_FIELDS.TYPE && !BUSINESS_USER_TYPES.includes(value) ? { businessName: "" } : {}),
});

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
  createUser: ({ firstName, lastName, email, roleId }) =>
    runUserAction(
      () => createUser({ firstName, lastName, email, role: roleId }).unwrap(),
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
