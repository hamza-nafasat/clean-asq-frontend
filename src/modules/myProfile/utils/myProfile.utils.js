import { UPLOAD_FIELD_NAMES } from "@/constants";
import { MY_PROFILE_FIELDS } from "./myProfile.constants";

// fields the account may edit, sent as they are typed
const EDITABLE_FIELDS = [
  MY_PROFILE_FIELDS.MIDDLE_NAME,
  MY_PROFILE_FIELDS.LAST_NAME,
  MY_PROFILE_FIELDS.CONTACT,
  MY_PROFILE_FIELDS.ADDRESS,
  MY_PROFILE_FIELDS.STATE,
  MY_PROFILE_FIELDS.COUNTRY,
];

export const buildProfileFromUser = (user) => ({
  firstName: user?.firstName || "",
  middleName: user?.middleName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  role: user?.role?.name || "",
  address: user?.address || "",
  state: user?.state || "",
  country: user?.country || "",
  contact: user?.contact || "",
  imageUrl: user?.image?.url || user?.image?.secureUrl || "",
});

export const buildProfileFormData = (profile, imageFile) => {
  const formData = new FormData();
  formData.append(MY_PROFILE_FIELDS.FIRST_NAME, profile.firstName.trim());
  EDITABLE_FIELDS.forEach((field) => formData.append(field, profile[field]?.trim() || ""));
  if (imageFile) formData.append(UPLOAD_FIELD_NAMES.SINGLE, imageFile);
  return formData;
};

export const validateProfile = (profile) => {
  const errors = {};
  if (!profile.firstName.trim()) errors.firstName = "First name is required";
  return errors;
};

export const validatePasswordForm = (passwordForm) => {
  const errors = {};
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    errors.confirmNewPassword = "New password and confirm password do not match";
  }
  return errors;
};

export const getDisplayName = (profile) =>
  [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") || "Your Profile";

export const getInitials = (profile) =>
  `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "U";
