import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useUpdateMyProfileMutation } from "@/redux/apis/auth.apis";
import { userExist } from "@/redux/slices/auth.slice";
import { toast } from "react-toastify";
import useConfirm from "@/hooks/useConfirm";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import MyProfileActions from "./MyProfileActions";
import MyProfileDetailsFields from "./MyProfileDetailsFields";
import MyProfileHeading from "./MyProfileHeading";
import MyProfileSummary from "./MyProfileSummary";
import getEnv from "@/utils/env";
import {
  IMAGE_MIME_PREFIX,
  MAX_IMAGE_SIZE_BYTES,
  MY_PROFILE_FORM_ID,
  MY_PROFILE_SCREEN_CONTEXT,
} from "../utils/myProfile.constants";
import { buildProfileAssistantActions } from "../utils/myProfile.assistant.utils";
import { buildProfileFormData, buildProfileFromUser, validateProfile } from "../utils/myProfile.utils";

const SERVER_URL = getEnv("SERVER_URL");

const MyProfileDetailsForm = ({ user = null }) => {
  const dispatch = useDispatch();
  const aiConfirm = useConfirm();
  const [updateMyProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => buildProfileFromUser(user));
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);

  // release the old preview url
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCancel = () => {
    setProfile(buildProfileFromUser(user));
    setErrors({});
    setImageFile(null);
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith(IMAGE_MIME_PREFIX)) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image must be 10 MB or smaller");
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateProfile(profile);
    if (Object.keys(validationErrors).length) return setErrors(validationErrors);
    setIsConfirmingUpdate(true);
  };

  // store and show the saved profile
  const applySavedUser = (savedUser) => {
    dispatch(userExist(savedUser));
    setProfile(buildProfileFromUser(savedUser));
    setImageFile(null);
    setIsEditing(false);
  };

  useScreenContext({
    ...MY_PROFILE_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}/api/ai/profile-chat`,
    currentState: buildProfileFromUser(user),
    actions: buildProfileAssistantActions({
      user,
      updateMyProfile,
      onProfileSaved: applySavedUser,
      askConfirm: aiConfirm.ask,
    }),
  });

  const handleConfirmUpdate = async () => {
    try {
      const res = await updateMyProfile(buildProfileFormData(profile, imageFile)).unwrap();
      applySavedUser(res.data);
      toast.success(res.message);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error?.data?.message || "Error while updating profile");
    } finally {
      setIsConfirmingUpdate(false);
    }
  };

  return (
    <>
      <MyProfileHeading
        isEditing={isEditing}
        isUpdating={isUpdating}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
      />

      <form
        id={MY_PROFILE_FORM_ID}
        onSubmit={handleSubmit}
        className="border-cardBorder overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <MyProfileSummary
          profile={profile}
          imageUrl={previewUrl || profile.imageUrl}
          isEditing={isEditing}
          onImageChange={handleImageChange}
        />

        <div className="space-y-8 px-6 py-8 sm:px-8">
          <MyProfileDetailsFields profile={profile} errors={errors} isEditing={isEditing} onChange={handleChange} />

          {isEditing && (
            <MyProfileActions
              className="border-cardBorder flex flex-wrap justify-end gap-3 border-t pt-6 md:hidden"
              isUpdating={isUpdating}
              onCancel={handleCancel}
            />
          )}
        </div>
      </form>

      <ConfirmationModal
        isOpen={isConfirmingUpdate}
        onClose={() => setIsConfirmingUpdate(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Profile"
        message="Are you sure you want to save the changes to your profile?"
        isLoading={isUpdating}
        confirmButtonText="Update"
      />

      <ConfirmationModal
        isOpen={aiConfirm.isOpen}
        title={aiConfirm.pending?.title}
        message={aiConfirm.pending?.message}
        confirmButtonText={aiConfirm.pending?.confirmButtonText}
        onConfirm={aiConfirm.resolveAsked}
        onClose={aiConfirm.close}
      />
    </>
  );
};

export default MyProfileDetailsForm;
