import Button from "@/components/shared/Button";

const ApplicationFormsRulesHeading = ({ isOrderChanged = false, isSavingOrder = false, onSaveOrder, onResetOrder }) => (
  <header className="flex flex-row items-center justify-between gap-4">
    <h1 className="text-textPrimary text-lg font-semibold">Manage Rules</h1>
    {isOrderChanged && (
      <div className="flex items-center gap-2">
        <Button label="Update Order" variant="primary" loading={isSavingOrder} onClick={onSaveOrder} />
        <Button label="Reset Order" variant="secondary" onClick={onResetOrder} />
      </div>
    )}
  </header>
);

export default ApplicationFormsRulesHeading;
