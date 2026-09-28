import Modal from "@/components/modals/SaveCancelModal";
import FormField from "@/components/global/FormField";
import { FIELD_TYPES } from "@/constants";
import { FORWARD_FIELD_PROPS, FORWARD_FORM_FIELDS } from "../utils/applications.constants";
import { getFullName } from "../utils/applications.utils";

const ApplicationsForwardModal = ({
  isOpen = false,
  initialData = null,
  values = {},
  errors = {},
  sectionOptions = [],
  isLoading = false,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;
  const applicant = initialData?.user;

  return (
    <Modal title="Forward a Section" saveButtonText="Send" onClose={onClose} onSave={onSubmit} isLoading={isLoading}>
      <FormField
        {...FORWARD_FIELD_PROPS}
        field={FORWARD_FORM_FIELDS.EMAIL}
        label="Email"
        type={FIELD_TYPES.EMAIL}
        value={values.email}
        onChange={onChange}
        error={errors.email}
      />
      {applicant?.email && (
        <button
          type="button"
          onClick={() => onChange?.({ target: { name: FORWARD_FORM_FIELDS.EMAIL, value: applicant.email } })}
          className="-mt-2 mb-4 cursor-pointer text-sm text-blue-600 hover:text-blue-800"
        >
          Send to the applicant, {getFullName(applicant)} ({applicant.email})
        </button>
      )}
      <FormField
        {...FORWARD_FIELD_PROPS}
        field={FORWARD_FORM_FIELDS.SECTION_KEY}
        label="Section"
        type={FIELD_TYPES.SELECT}
        value={values.sectionKey}
        options={sectionOptions}
        onChange={onChange}
        error={errors.sectionKey}
      />
    </Modal>
  );
};

export default ApplicationsForwardModal;
