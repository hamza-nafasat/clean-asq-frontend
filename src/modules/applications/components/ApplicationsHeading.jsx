import PageHeading from "@/components/global/PageHeading";

const COUNT_PILL_CLASSES = "rounded-full px-3 py-1 text-xs font-medium";

const ApplicationsHeading = ({ submittedCount = 0, draftCount = 0 }) => (
  <PageHeading
    className="mb-5"
    title="Applications"
    description="Submitted applications and drafts on the forms you own."
    actions={
      <ul className="flex gap-2">
        <li className={`${COUNT_PILL_CLASSES} bg-green-50 text-green-700`}>Submitted: {submittedCount}</li>
        <li className={`${COUNT_PILL_CLASSES} bg-yellow-50 text-yellow-800`}>Drafts: {draftCount}</li>
      </ul>
    }
  />
);

export default ApplicationsHeading;
