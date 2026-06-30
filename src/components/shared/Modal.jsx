import PropTypes from 'prop-types';
import { memo } from 'react';
import Button from './small/Button';
// import Button from './Button';
import { IoCloseSharp } from 'react-icons/io5';

const Modal = memo(
  ({
    title,
    children,
    onClose,
    onSave,
    isLoading = false,
    saveButtonText = 'Save',
    cancelButtonText = 'Cancel',
    hideCancelButton = false,
    hideSaveButton = false,
  }) => {
    // const handleBackdropClick = useCallback(
    //   e => {
    //     // Only close if clicking the backdrop itself, not its children
    //     if (e.target === e.currentTarget) {
    //       onClose();
    //     }
    //   },
    //   [onClose]
    // );

    return (
      <div
        className="fixed inset-0 z-50 flex h-full items-center justify-center overflow-auto bg-black/50"
        // onClick={handleBackdropClick}
      >
        <div className="scroll-0 max-h-[70%] w-[90%] max-w-3xl overflow-auto rounded-md bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-textPrimary text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-500" disabled={isLoading}>
              <IoCloseSharp />
            </button>
          </div>

          <div className="mb-6">{children}</div>

          <div className="flex justify-end gap-2">
            {!hideCancelButton && (
              <Button variant="secondary" label={cancelButtonText} onClick={onClose} disabled={isLoading} />
            )}
            {!hideSaveButton && (
              <Button
                variant="primary"
                label={isLoading ? 'Loading...' : saveButtonText}
                onClick={onSave}
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  saveButtonText: PropTypes.string,
  saveButtonClassName: PropTypes.string,
  cancelButtonClassName: PropTypes.string,
  cancelButtonText: PropTypes.string,
  hideSaveButton: PropTypes.bool,
};

Modal.displayName = 'Modal';

export default Modal;
