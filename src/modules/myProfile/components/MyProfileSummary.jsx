import { useRef } from "react";
import { HiOutlineCamera } from "react-icons/hi";
import { getDisplayName, getInitials } from "../utils/myProfile.utils";

const MyProfileSummary = ({ profile = {}, imageUrl = "", isEditing = false, onImageChange }) => {
  const fileInputRef = useRef(null);
  const displayName = getDisplayName(profile);

  return (
    <header className="from-secondary/10 border-cardBorder bg-linear-to-r via-white to-primary/5 border-b px-6 py-8 sm:px-8">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <div className="border-secondary/20 h-28 w-28 overflow-hidden rounded-full border-4 bg-white shadow-md">
            {imageUrl ? (
              <img src={imageUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="bg-secondary/10 text-secondary flex h-full w-full items-center justify-center text-3xl font-bold">
                {getInitials(profile)}
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
                onChange={(e) => onImageChange?.(e)}
              />
            </>
          )}
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-textPrimary mb-1 text-2xl font-semibold">{displayName}</h2>
          <p className="text-sm text-gray-500">{profile.email || "No email"}</p>
          <span className="bg-secondary/10 text-secondary mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize">
            {profile.role || "No role"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default MyProfileSummary;
