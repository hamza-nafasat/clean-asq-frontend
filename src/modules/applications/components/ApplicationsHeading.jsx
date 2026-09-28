const COUNT_PILL_CLASSES = "rounded-full px-3 py-1 text-xs font-medium";

const ApplicationsHeading = ({ submittedCount = 0, draftCount = 0 }) => (
  <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-textPrimary text-xl font-semibold">Applications</h1>
      <p className="mt-1 text-sm text-gray-500">Submitted applications and drafts on the forms you own.</p>
    </div>
    <ul className="flex gap-2">
      <li className={`${COUNT_PILL_CLASSES} bg-green-50 text-green-700`}>Submitted: {submittedCount}</li>
      <li className={`${COUNT_PILL_CLASSES} bg-yellow-50 text-yellow-800`}>Drafts: {draftCount}</li>
    </ul>
  </header>
);

export default ApplicationsHeading;
