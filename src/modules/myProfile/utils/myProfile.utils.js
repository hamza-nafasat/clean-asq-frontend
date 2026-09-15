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
  formData.append("firstName", profile.firstName.trim());
  formData.append("middleName", profile.middleName?.trim() || "");
  formData.append("lastName", profile.lastName?.trim() || "");
  formData.append("contact", profile.contact || "");
  formData.append("address", profile.address || "");
  formData.append("state", profile.state || "");
  formData.append("country", profile.country || "");
  if (imageFile) formData.append("file", imageFile);
  return formData;
};

export const getDisplayName = (profile) =>
  [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") || "Your Profile";

export const getInitials = (profile) =>
  `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "U";
