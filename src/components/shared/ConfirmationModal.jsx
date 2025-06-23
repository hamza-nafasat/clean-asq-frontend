import Modal from './Modal';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  confirmButtonText = 'Delete',
  confirmButtonClassName = '!bg-red-500 !border-red-500 hover:!bg-red-600 hover:!border-red-600',
  cancelButtonText = 'Cancel',
  cancelButtonClassName = '!bg-gray-500 !border-gray-500 hover:!bg-gray-400 hover:!border-gray-400',
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
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
