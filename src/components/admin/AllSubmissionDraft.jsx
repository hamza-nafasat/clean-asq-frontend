import Draft from "./Draft";
import Submission from "./Submission";

function AllSubmissionDraft({ forms }) {
  const drafts = forms?.saved || [];
  const submitted = forms?.submitted || [];
  const hasNothing = drafts.length === 0 && submitted.length === 0;

  return (
    <div className="w-full space-y-8">
      {hasNothing && (
        <div className="rounded-lg border bg-white/80 p-8 text-center shadow-sm">
          <p className="text-textPrimary text-lg font-semibold">You have no applications yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Once you start an application it will appear here, whether it is finished or not.
          </p>
        </div>
      )}

      {drafts.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-textPrimary text-lg font-semibold">In progress</h2>
            <p className="text-sm text-gray-500">Applications you started but have not submitted yet.</p>
          </div>
          <Draft forms={drafts} />
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-textPrimary text-lg font-semibold">Submitted</h2>
            <p className="text-sm text-gray-500">Applications you have already sent for review.</p>
          </div>
          <Submission forms={submitted} />
        </section>
      )}
    </div>
  );
}

export default AllSubmissionDraft;
