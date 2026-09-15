import Button from "@/components/shared/Button";
import Modal from "@/components/shared/Modal";

const ApplicationPdfBankModal = ({ isOpen = false, bank = {}, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <Modal title="Bank for your routing number " isOpen={isOpen} onClose={onClose}>
      {bank?.bankName ? (
        <>
          <p className="mb-6 leading-relaxed text-gray-600">
            That routing number belongs to <span className="font-semibold text-gray-900">{bank.bankName}</span>. Is
            this the bank you intended to enter?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" label="No" onClick={onClose} className="rounded-lg px-4 py-2" />
            <Button label="Yes" onClick={() => onConfirm?.(bank.bankName)} className="rounded-lg px-4 py-2" />
          </div>
        </>
      ) : (
        <>
          <h2 className="mb-3 text-xl font-semibold text-red-600">
            We could not identify a bank with this routing number. Please double-check the number or try again.
          </h2>
          <div className="flex justify-end">
            <Button label="Close" onClick={onClose} className="rounded-lg px-4 py-2" />
          </div>
        </>
      )}
    </Modal>
  );
};

export default ApplicationPdfBankModal;
