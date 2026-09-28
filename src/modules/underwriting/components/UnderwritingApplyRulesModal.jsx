import Modal from "@/components/modals/SaveCancelModal";
import Button from "@/components/shared/Button";
import { countEmailRecipients } from "../utils/underwriting.utils";

const UnderwritingApplyRulesModal = ({ isOpen = false, emails = [], isLoading = false, onApply, onClose }) => {
  if (!isOpen) return null;
  const peopleCount = countEmailRecipients(emails);

  return (
    <Modal
      title="Apply Rules"
      onClose={onClose}
      onSave={onClose}
      isLoading={isLoading}
      hideSaveButton
      hideCancelButton
      isTopLayer
    >
      {peopleCount ? (
        <>
          <p className="text-gray-700">
            The rules will email <span className="font-semibold">{peopleCount}</span>{" "}
            {peopleCount === 1 ? "person" : "people"}. Send these emails?
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {emails.map((plan) => (
              <li key={plan.ruleName} className="rounded-lg border border-gray-200 p-3 text-sm">
                <span className="text-textPrimary block font-medium">{plan.ruleName}</span>
                <span className="block break-all text-gray-500">{plan.recipients.join(", ")}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-700">No rule emails will be sent. The rules may still change the status.</p>
      )}

      <footer className="mt-6 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" label="Cancel" onClick={onClose} disabled={isLoading} />
        {peopleCount > 0 && (
          <Button
            type="button"
            variant="secondary"
            label="Apply without emails"
            onClick={() => onApply?.(false)}
            loading={isLoading}
          />
        )}
        <Button
          type="button"
          label={peopleCount ? "Apply and send emails" : "Apply Rules"}
          onClick={() => onApply?.(peopleCount > 0)}
          loading={isLoading}
        />
      </footer>
    </Modal>
  );
};

export default UnderwritingApplyRulesModal;
