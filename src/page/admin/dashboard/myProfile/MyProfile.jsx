import Button from "@/components/shared/small/Button";
import TextField from "@/components/shared/small/TextField";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineCamera, HiOutlineUserCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const EMPTY_PROFILE = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  role: "",
  address: "",
  state: "",
  country: "",
  contact: "",
  imageUrl: "",
};

const buildProfileFromUser = (user) => ({
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

const MyProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [backupProfile, setBackupProfile] = useState(EMPTY_PROFILE);

  useEffect(() => {
    const next = buildProfileFromUser(user);
    setProfile(next);
    setBackupProfile(next);
  }, [user]);

  const displayName = useMemo(() => {
    return [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") || "Your Profile";
  }, [profile.firstName, profile.middleName, profile.lastName]);

  const initials = useMemo(() => {
    const first = profile.firstName?.[0] || "";
    const last = profile.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  }, [profile.firstName, profile.lastName]);

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
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, imageUrl: previewUrl }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!profile.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    try {
      setIsUpdating(true);
      // Frontend-only for now — wire updateMyProfile API later
      await new Promise((resolve) => setTimeout(resolve, 400));
      setBackupProfile(profile);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error while updating profile", error);
      toast.error("Error while updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-textPrimary text-3xl font-bold">My Profile</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            View your account details. Click Edit to update your personal information.
          </p>
        </div>

        {!isEditing ? (
          <Button type="button" label="Edit" onClick={handleEdit} className="rounded-[12px]! px-6!" />
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              label="Cancel"
              onClick={handleCancel}
              disabled={isUpdating}
              className="rounded-[12px]! px-6!"
            />
            <Button
              type="submit"
              form="my-profile-form"
              label="Update"
              loading={isUpdating}
              disabled={isUpdating}
              className="rounded-[12px]! px-6!"
            />
          </div>
        )}
      </div>

      <form
        id="my-profile-form"
        onSubmit={handleUpdate}
        className="overflow-hidden rounded-2xl border border-[#E8EEF5] bg-white shadow-sm"
      >
        <div className="from-secondary/10 via-white to-primary/5 border-b border-[#E8EEF5] bg-linear-to-r px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="border-secondary/20 h-28 w-28 overflow-hidden rounded-full border-4 bg-white shadow-md">
                {profile?.image?.secureUrl ? (
                  <img src={profile?.image?.secureUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="bg-secondary/10 text-secondary flex h-full w-full items-center justify-center text-3xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-buttonTextPrimary absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition hover:brightness-110"
                    aria-label="Change profile image"
                  >
                    <HiOutlineCamera className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </div>

            <div className="text-center sm:text-left">
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-textPrimary text-2xl font-semibold">{displayName}</h2>
              </div>
              <p className="text-sm text-gray-500">{profile?.email || "No email"}</p>
              <span className="bg-secondary/10 text-secondary mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize">
                {profile?.role || "No role"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          <section>
            <h3 className="text-textPrimary mb-4 text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <TextField
                borderAndBgChangeIfEmpty={false}
                name="firstName"
                label="First Name"
                placeholder="Enter first name"
                required
                disabled={!isEditing}
                value={profile?.firstName}
                onChange={handleChange}
              />
              <TextField
                borderAndBgChangeIfEmpty={false}
                name="middleName"
                label="Middle Name"
                placeholder="Enter middle name"
                disabled={!isEditing}
                value={profile?.middleName}
                onChange={handleChange}
              />
              <TextField
                borderAndBgChangeIfEmpty={false}
                name="lastName"
                label="Last Name"
                placeholder="Enter last name"
                disabled={!isEditing}
                value={profile?.lastName}
                onChange={handleChange}
              />
              <TextField
                borderAndBgChangeIfEmpty={false}
                type="email"
                name="email"
                label="Email"
                placeholder="Email address"
                disabled
                value={profile?.email}
                onChange={handleChange}
              />
              <TextField
                borderAndBgChangeIfEmpty={false}
                name="role"
                label="Role"
                placeholder="Role"
                disabled
                value={profile?.role}
                onChange={handleChange}
              />
              <TextField
                borderAndBgChangeIfEmpty={false}
                name="contact"
                label="Contact"
                placeholder="Enter contact number"
                type="tel"
                disabled={!isEditing}
                value={profile?.contact}
                onChange={handleChange}
              />
            </div>
          </section>

          <section>
            <h3 className="text-textPrimary mb-4 text-lg font-semibold">Address Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextField
                  borderAndBgChangeIfEmpty={false}
                  name="address"
                  label="Address"
                  placeholder="Enter address"
                  disabled={!isEditing}
                  value={profile?.address}
                  onChange={handleChange}
                />
              </div>
              <TextField
                borderAndBgChangeIfEmpty={false}
                name="state"
                label="State"
                placeholder="Enter state"
                disabled={!isEditing}
                value={profile?.state}
                onChange={handleChange}
              />
              <TextField
                borderAndBgChangeIfEmpty={false}
                name="country"
                label="Country"
                placeholder="Enter country"
                disabled={!isEditing}
                value={profile?.country}
                onChange={handleChange}
              />
            </div>
          </section>

          {isEditing && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#E8EEF5] pt-6 md:hidden">
              <Button
                type="button"
                variant="secondary"
                label="Cancel"
                onClick={handleCancel}
                disabled={isUpdating}
                className="rounded-[12px]! px-6!"
              />
              <Button
                type="submit"
                label="Update"
                loading={isUpdating}
                disabled={isUpdating}
                className="rounded-[12px]! px-6!"
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default MyProfile;
