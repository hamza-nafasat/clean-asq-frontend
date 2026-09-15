import { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useAttachTemplateToFormMutation, useUnAttachedFormsListQuery } from "@/redux/apis/email.apis";
import { userExist } from "@/redux/slices/auth.slice";
import Modal from "@/components/modals/SaveCancelModal";
import Checkbox from "@/components/shared/Checkbox";
import CustomLoading from "@/components/shared/CustomLoading";
import DropdownCheckbox from "@/components/shared/DropdownCheckbox";
import { EMAIL_TYPE_VALUES } from "@/modules/email/utils/email.constants";

const EmailAttachFormsModal = ({ setIsAttachFormModalOpen, selectedTemplate }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: unAttachedForms, isLoading: isLoadingUnAttachedForms } = useUnAttachedFormsListQuery(
    { emailTemplateId: selectedTemplate?._id },
    { skip: !selectedTemplate?._id },
  );
  const [getUserProfile, { isLoading: isLoadingUserProfile }] = useGetMyProfileFirstTimeMutation();
  const [selectedForms, setSelectedForms] = useState(selectedTemplate?.forms?.map((form) => form._id) || []);
  const [attachEmailToForms, { isLoading }] = useAttachTemplateToFormMutation();
  const [attachToMe, setAttachToMe] = useState(user?.welcomeMail === selectedTemplate?._id);

  const handleSave = async () => {
    if (!selectedTemplate?._id) return toast.error("Please select template and forms");
    try {
      const res = await attachEmailToForms({
        emailTemplateId: selectedTemplate?._id,
        formIds: selectedForms?.length ? selectedForms : [],
        attachToMe: attachToMe,
      }).unwrap();
      if (res.success) {
        const userData = await getUserProfile().unwrap();
        if (userData?.success) {
          dispatch(userExist(userData?.data));
        }
        toast.success("Template attached to forms successfully");
        setIsAttachFormModalOpen?.(false);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to attach template to forms");
      console.error("Attach template error:", error);
    }
  };

  return (
    <Modal
      isLoading={isLoading || isLoadingUserProfile}
      onSave={handleSave}
      onClose={() => setIsAttachFormModalOpen?.(false)}
    >
      {isLoadingUnAttachedForms ? (
        <CustomLoading />
      ) : (
        <div className="p-4 min-h-[30vh]">
          <h2 className="mb-4 text-lg font-semibold">Attach To Forms</h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Select Forms</label>
            <DropdownCheckbox
              options={unAttachedForms?.data?.map((item) => ({ label: item?.name, value: item?._id }))}
              selected={selectedForms}
              defaultText={`Select Forms`}
              onSelect={(vals) => setSelectedForms(vals)}
            />
          </div>
          {selectedTemplate.emailType === EMAIL_TYPE_VALUES.WELCOME && (
            <div className="flex justify-end">
              <Checkbox
                id="attachToMe"
                name="attachToMe"
                label="Attach to Me"
                onChange={(e) => setAttachToMe(e.target.checked)}
                value={attachToMe}
                checked={attachToMe}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default memo(EmailAttachFormsModal);
