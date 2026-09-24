export const MY_PROFILE_FIELDS = {
  FIRST_NAME: "firstName",
  MIDDLE_NAME: "middleName",
  LAST_NAME: "lastName",
  EMAIL: "email",
  ROLE: "role",
  CONTACT: "contact",
  ADDRESS: "address",
  STATE: "state",
  COUNTRY: "country",
};

export const PASSWORD_FIELDS = {
  CURRENT_PASSWORD: "currentPassword",
  NEW_PASSWORD: "newPassword",
  CONFIRM_NEW_PASSWORD: "confirmNewPassword",
};

export const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export const MY_PROFILE_FORM_ID = "my-profile-form";

export const IMAGE_MIME_PREFIX = "image/";

// matches the backend upload limit
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
