import confirmOrCancel from "@/utils/confirmOrCancel";
import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";
import { MY_PROFILE_FIELDS } from "./myProfile.constants";
import { buildProfileFormData, buildProfileFromUser, validateProfile } from "./myProfile.utils";

// fields the assistant may change
const AI_EDITABLE_FIELD_LABELS = {
  [MY_PROFILE_FIELDS.FIRST_NAME]: "First name",
  [MY_PROFILE_FIELDS.MIDDLE_NAME]: "Middle name",
  [MY_PROFILE_FIELDS.LAST_NAME]: "Last name",
  [MY_PROFILE_FIELDS.CONTACT]: "Contact",
  [MY_PROFILE_FIELDS.ADDRESS]: "Address",
  [MY_PROFILE_FIELDS.STATE]: "State",
  [MY_PROFILE_FIELDS.COUNTRY]: "Country",
};

// editable fields that really change
const pickProfileChanges = (savedProfile, changes) =>
  Object.fromEntries(
    Object.keys(AI_EDITABLE_FIELD_LABELS)
      .filter((field) => typeof changes[field] === "string" && changes[field].trim() !== savedProfile[field])
      .map((field) => [field, changes[field].trim()]),
  );

const describeChanges = (profileChanges) =>
  Object.entries(profileChanges)
    .map(([field, value]) => `${AI_EDITABLE_FIELD_LABELS[field]}: "${value || "(empty)"}"`)
    .join(", ");

export const buildProfileAssistantActions = ({ user, updateMyProfile, onProfileSaved, askConfirm }) => ({
  [AI_TOOLS.UPDATE_MY_PROFILE]: async (changes) => {
    const savedProfile = buildProfileFromUser(user);
    const profileChanges = pickProfileChanges(savedProfile, changes);
    if (!Object.keys(profileChanges).length) throw new Error("Those details are already saved");
    const profile = { ...savedProfile, ...profileChanges };
    const [validationError] = Object.values(validateProfile(profile));
    if (validationError) throw new Error(validationError);
    await confirmOrCancel(askConfirm, {
      title: "Update Profile",
      message: `Save these changes to your profile? ${describeChanges(profileChanges)}`,
      confirmButtonText: "Update",
    });
    const res = await updateMyProfile(buildProfileFormData(profile)).unwrap();
    onProfileSaved(res.data);
  },
});
