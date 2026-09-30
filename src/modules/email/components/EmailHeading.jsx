import Button from "@/components/shared/Button";
import PageHeading from "@/components/global/PageHeading";

const EmailHeading = ({ canCreate = false, onCreate }) => (
  <PageHeading
    className="mb-6"
    title="Email Templates"
    description="The emails sent to applicants, owners and reviewers, and the forms that use them."
    actions={canCreate && <Button label="Create Email Template" onClick={onCreate} data-testid="email-create-btn" />}
  />
);

export default EmailHeading;
