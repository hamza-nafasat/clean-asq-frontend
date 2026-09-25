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

export const MY_PROFILE_SCREEN_CONTEXT = {
  screenId: "my-profile",
  screenName: "My Profile",
  assistantName: "Profile Assistant",
  description:
    "The My Profile screen shows the signed-in user's own account details — name, contact number and address — and lets them update those details or change their password.",
  greeting: `Hi! I'm your **Profile Assistant**.\n\nI can help you:\n- **Update your details** — first, middle and last name, contact number and address\n- **Answer questions** about your saved profile\n\nWhat would you like to change?`,
};

export const IMAGE_MIME_PREFIX = "image/";

// matches the backend upload limit
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
