import Modal from "@/components/modals/SaveCancelModal";
import FormField from "@/components/global/FormField";
import { FIELD_TYPES } from "@/constants";
import { INVITE_FORM_FIELDS } from "../utils/myApplications.constants";

const MyApplicationsInviteOwnerModal = ({
  isOpen = false,
  owners = [],
  values = {},
  errors = {},
  isLoading = false,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      title="Invite a Beneficial Owner"
      saveButtonText="Send Invite"
      onClose={onClose}
      onSave={onSubmit}
      isLoading={isLoading}
    >
      <FormField
        field={INVITE_FORM_FIELDS.EMAIL}
        label="Email"
        type={FIELD_TYPES.EMAIL}
        value={values.email}
        onChange={onChange}
        error={errors.email}
      />
      {owners.length > 0 && (
        <section>
          <p className="mb-2 text-sm text-gray-500">Or pick an owner already on this application:</p>
          <ul className="flex flex-wrap gap-2">
            {owners.map((owner) => (
              <li key={owner.email}>
                <button
                  type="button"
                  onClick={() => onChange?.({ target: { name: INVITE_FORM_FIELDS.EMAIL, value: owner.email } })}
                  className="cursor-pointer rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {owner.name || owner.email}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Modal>
  );
};

export default MyApplicationsInviteOwnerModal;
