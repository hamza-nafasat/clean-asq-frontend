import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useUpdateMyProfileMutation } from "@/redux/apis/auth.apis";
import { userExist } from "@/redux/slices/auth.slice";
import MyProfileActions from "./components/MyProfileActions";
import MyProfileDetailsFields from "./components/MyProfileDetailsFields";
import MyProfileHeading from "./components/MyProfileHeading";
import MyProfilePasswordForm from "./components/MyProfilePasswordForm";
import MyProfileSummary from "./components/MyProfileSummary";
import { EMPTY_PROFILE, IMAGE_MIME_PREFIX, MY_PROFILE_FORM_ID } from "./utils/myProfile.constants";
import { buildProfileFormData, buildProfileFromUser } from "./utils/myProfile.utils";

const MyProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [backupProfile, setBackupProfile] = useState(EMPTY_PROFILE);
  const [imageFile, setImageFile] = useState(null);
  const [updateMyProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();

  // reset the editable copy when the user changes
  useEffect(() => {
    const next = buildProfileFromUser(user);
    setProfile(next);
    setBackupProfile(next);
    setImageFile(null);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setBackupProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile(backupProfile);
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
    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setProfile((prev) => ({ ...prev, imageUrl: previewUrl }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!profile.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    try {
      const res = await updateMyProfile(buildProfileFormData(profile, imageFile)).unwrap();
      if (res.success) {
        if (res.data) dispatch(userExist(res.data));
        setIsEditing(false);
        setImageFile(null);
        toast.success(res.message || "Profile updated successfully");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error?.data?.message || "Error while updating profile");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <MyProfileHeading isEditing={isEditing} isUpdating={isUpdating} onEdit={handleEdit} onCancel={handleCancel} />

      <form
        id={MY_PROFILE_FORM_ID}
        onSubmit={handleUpdate}
        className="overflow-hidden rounded-2xl border border-[#E8EEF5] bg-white shadow-sm"
      >
        <MyProfileSummary profile={profile} isEditing={isEditing} onImageChange={handleImageChange} />

        <div className="space-y-8 px-6 py-8 sm:px-8">
          <MyProfileDetailsFields profile={profile} isEditing={isEditing} onChange={handleChange} />

          {isEditing && (
            <MyProfileActions
              className="flex flex-wrap justify-end gap-3 border-t border-[#E8EEF5] pt-6 md:hidden"
              isUpdating={isUpdating}
              onCancel={handleCancel}
            />
          )}
        </div>
      </form>

      <MyProfilePasswordForm />
    </div>
  );
};

export default MyProfile;
