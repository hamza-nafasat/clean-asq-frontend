import Button from "@/components/shared/Button";
import PageHeading from "@/components/global/PageHeading";

const ApplicationFormsRulesHeading = ({ isOrderChanged = false, isSavingOrder = false, onSaveOrder, onResetOrder }) => (
  <PageHeading
    title="Manage Rules"
    description="Rules run on each submission to set its status or send emails, in the order listed."
    actions={
      isOrderChanged && (
        <>
          <Button label="Update Order" variant="primary" loading={isSavingOrder} onClick={onSaveOrder} />
          <Button label="Reset Order" variant="secondary" onClick={onResetOrder} />
        </>
      )
    }
  />
);

export default ApplicationFormsRulesHeading;
