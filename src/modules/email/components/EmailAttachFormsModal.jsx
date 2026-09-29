import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAttachTemplateToFormMutation, useUnAttachedFormsListQuery } from "@/redux/apis/email.apis";
import { userExist } from "@/redux/slices/auth.slice";
import SaveCancelModal from "@/components/modals/SaveCancelModal";
import Checkbox from "@/components/shared/Checkbox";
import CustomLoading from "@/components/shared/CustomLoading";
import DropdownCheckbox from "@/components/shared/DropdownCheckbox";
import { EMAIL_TEMPLATE_TYPES } from "@/constants";

const EmailAttachFormsModal = ({ isOpen = false, template = null, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: availableForms, isLoading: isLoadingForms } = useUnAttachedFormsListQuery(
    { emailTemplateId: template?._id },
    { skip: !isOpen || !template?._id },
  );
  const [getUserProfile, { isLoading: isLoadingUserProfile }] = useGetMyProfileFirstTimeMutation();
  const [attachEmailToForms, { isLoading }] = useAttachTemplateToFormMutation();
  const [selectedForms, setSelectedForms] = useState(() => template?.forms?.map((form) => form._id) || []);
  const [attachToMe, setAttachToMe] = useState(() => user?.welcomeMail === template?._id);

  if (!isOpen) return null;

  const isWelcomeTemplate = template?.emailType === EMAIL_TEMPLATE_TYPES.WELCOME;

  const handleSave = async () => {
    try {
      await attachEmailToForms({
        emailTemplateId: template._id,
        formIds: selectedForms,
        ...(isWelcomeTemplate && { attachToMe }),
      }).unwrap();
      // the profile holds the welcome mail link
      const profile = await getUserProfile().unwrap();
      if (profile?.success) dispatch(userExist(profile.data));
      toast.success("Template attached to forms successfully");
      onClose?.();
    } catch (error) {
      console.error("Attach template error:", error);
      toast.error(error?.data?.message || "Failed to attach template to forms");
    }
  };

  return (
    <SaveCancelModal isLoading={isLoading || isLoadingUserProfile} onSave={handleSave} onClose={onClose}>
      {isLoadingForms ? (
        <CustomLoading />
      ) : (
        <div className="min-h-[30vh] p-4">
          <h2 className="mb-4 text-lg font-semibold">Attach To Forms</h2>
          <div className="mb-4">
            <p className="mb-1 block text-sm font-medium">Select Forms</p>
            <DropdownCheckbox
              options={availableForms?.data?.map((form) => ({ label: form.name, value: form._id }))}
              selected={selectedForms}
              defaultText="Select Forms"
              onSelect={setSelectedForms}
            />
          </div>
          {isWelcomeTemplate && (
            <div className="flex justify-end">
              <Checkbox
                id="attachToMe"
                name="attachToMe"
                label="Attach to Me"
                onChange={(e) => setAttachToMe(e.target.checked)}
                checked={attachToMe}
              />
            </div>
          )}
        </div>
      )}
    </SaveCancelModal>
  );
};

export default EmailAttachFormsModal;
