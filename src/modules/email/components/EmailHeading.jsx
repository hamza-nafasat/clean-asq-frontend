import Button from "@/components/shared/Button";

const EmailHeading = ({ canCreate = false, onCreate }) => (
  <header className="flex items-center justify-between">
    <h1 className="mb-6 text-2xl font-semibold">Email Templates</h1>
    {canCreate && <Button label="Create Email Template" onClick={onCreate} data-testid="email-create-btn" />}
  </header>
);

export default EmailHeading;
