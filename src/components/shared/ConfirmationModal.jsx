import Modal from './Modal';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  confirmButtonText = 'Delete',
  confirmButtonClassName = '',
  cancelButtonText = 'Cancel',
  cancelButtonClassName = '',
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      title={title}
      onClose={onClose}
      onSave={onConfirm}
      isLoading={isLoading}
      saveButtonText={confirmButtonText}
      saveButtonClassName={confirmButtonClassName}
      cancelButtonText={cancelButtonText}
      cancelButtonClassName={cancelButtonClassName}
      hideSaveButton={false}
    >
      <div className="py-4">
        <div className="text-gray-700">{message}</div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
