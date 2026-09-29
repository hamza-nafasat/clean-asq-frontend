import Modal from "@/components/shared/Modal";
import ApplicantFormDisplayTextModal from "./ApplicantFormDisplayTextModal";
import ApplicantSectionTextModal from "./ApplicantSectionTextModal";
import ApplicantSignatureCustomizeModal from "./ApplicantSignatureCustomizeModal";
import ApplicantSignatureHelpModal from "./ApplicantSignatureHelpModal";
import { FORM_DISPLAY_TEXT_FIELDS } from "@/constants";
import { SINGLE_APPLICATION_MODALS } from "../utils/applicant.constants";

const ApplicantSingleApplicationModals = ({ activeModal = null, formDocument, section, formRefetch, onClose }) => {
  if (!activeModal) return null;

  if (activeModal === SINGLE_APPLICATION_MODALS.OTP_TEXT && formDocument) {
    return (
      <Modal onClose={onClose}>
        <ApplicantFormDisplayTextModal
          form={formDocument}
          fieldKeys={FORM_DISPLAY_TEXT_FIELDS.OTP}
          previewClassName="w-full text-center"
          formRefetch={formRefetch}
          onClose={onClose}
        />
      </Modal>
    );
  }
  if (activeModal === SINGLE_APPLICATION_MODALS.ID_MISSION_DATA_TEXT) {
    return (
      <Modal onClose={onClose}>
        <ApplicantFormDisplayTextModal
          form={formDocument}
          fieldKeys={FORM_DISPLAY_TEXT_FIELDS.ID_MISSION_DATA}
          formRefetch={formRefetch}
          onClose={onClose}
        />
      </Modal>
    );
  }
  if (activeModal === SINGLE_APPLICATION_MODALS.SIGNATURE) {
    return (
      <Modal onClose={onClose}>
        <ApplicantSignatureCustomizeModal section={section} formRefetch={formRefetch} onClose={onClose} />
      </Modal>
    );
  }
  if (activeModal === SINGLE_APPLICATION_MODALS.SIGNATURE_HELP) {
    return (
      <Modal onClose={onClose}>
        <ApplicantSignatureHelpModal section={section} formRefetch={formRefetch} onClose={onClose} />
      </Modal>
    );
  }
  if (activeModal === SINGLE_APPLICATION_MODALS.ID_MISSION_SECTION_TEXT && section) {
    return (
      <Modal onClose={onClose}>
        <ApplicantSectionTextModal section={section} onClose={onClose} />
      </Modal>
    );
  }
  return null;
};

export default ApplicantSingleApplicationModals;
