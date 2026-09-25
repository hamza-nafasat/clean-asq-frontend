import EmptyState from "@/components/shared/EmptyState";
import MyApplicationsDrafts from "./MyApplicationsDrafts";
import MyApplicationsOwnerInvitations from "./MyApplicationsOwnerInvitations";
import MyApplicationsSubmissions from "./MyApplicationsSubmissions";

const MyApplicationsTabs = ({ forms = {}, invitations = [] }) => {
  const drafts = forms?.saved || [];
  const submitted = forms?.submitted || [];
  const hasNothing = drafts.length === 0 && submitted.length === 0 && invitations.length === 0;

  return (
    <div className="w-full space-y-8">
      {hasNothing && (
        <EmptyState
          variant="panel"
          title="You have no applications yet"
          description="Once you start an application it will appear here, whether it is finished or not."
        />
      )}

      {invitations.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-textPrimary text-lg font-semibold">Waiting for your details</h2>
            <p className="text-sm text-gray-500">Applications where you were added as an owner or operator.</p>
          </div>
          <MyApplicationsOwnerInvitations invitations={invitations} />
        </section>
      )}

      {drafts.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-textPrimary text-lg font-semibold">In progress</h2>
            <p className="text-sm text-gray-500">Applications you started but have not submitted yet.</p>
          </div>
          <MyApplicationsDrafts forms={drafts} />
        </section>
      )}

      {submitted.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-textPrimary text-lg font-semibold">Submitted</h2>
            <p className="text-sm text-gray-500">Applications you have already sent for review.</p>
          </div>
          <MyApplicationsSubmissions forms={submitted} />
        </section>
      )}
    </div>
  );
};

export default MyApplicationsTabs;
