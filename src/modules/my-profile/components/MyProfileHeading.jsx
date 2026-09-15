import Button from "@/components/shared/Button";
import MyProfileActions from "./MyProfileActions";
import { MY_PROFILE_FORM_ID } from "../utils/my-profile.constants";

const MyProfileHeading = ({ isEditing = false, isUpdating = false, onEdit, onCancel }) => (
  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-textPrimary text-3xl font-bold">My Profile</h1>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">
        View your account details. Click Edit to update your personal information. Email and role stay read-only.
      </p>
    </div>

    {!isEditing ? (
      <Button type="button" label="Edit" onClick={() => onEdit?.()} className="rounded-[12px]! px-6!" />
    ) : (
      <MyProfileActions
        className="flex flex-wrap gap-3"
        formId={MY_PROFILE_FORM_ID}
        isUpdating={isUpdating}
        onCancel={onCancel}
      />
    )}
  </div>
);

export default MyProfileHeading;
