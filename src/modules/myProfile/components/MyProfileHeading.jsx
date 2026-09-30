import Button from "@/components/shared/Button";
import MyProfileActions from "./MyProfileActions";
import { MY_PROFILE_FORM_ID } from "../utils/myProfile.constants";
import PageHeading from "@/components/global/PageHeading";

const MyProfileHeading = ({ isEditing = false, isUpdating = false, onEdit, onCancel }) => (
  <PageHeading
    className="mb-6"
    title="My Profile"
    description="View your account details. Click Edit to update your personal information. Email and role stay read-only."
    actions={
      !isEditing ? (
        <Button type="button" label="Edit" onClick={() => onEdit?.()} />
      ) : (
        <MyProfileActions
          className="flex flex-wrap gap-3"
          formId={MY_PROFILE_FORM_ID}
          isUpdating={isUpdating}
          onCancel={onCancel}
        />
      )
    }
  />
);

export default MyProfileHeading;
