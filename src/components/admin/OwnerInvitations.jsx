import { useNavigate } from "react-router-dom";
import Button from "../shared/small/Button";

/**
 * Beneficial-owner forms the signed-in user was invited to complete (QA 5.44).
 * Each card opens the hidden owner form with the invitation token, so the owner
 * no longer has to copy the link out of their email.
 */
function OwnerInvitations({ invitations }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
      {invitations.map((invite) => {
        const colors = invite?.branding?.colors;

        return (
          <div
            key={`${invite.formId}-${invite.sectionKey}`}
            className="relative flex h-full w-full min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:border-gray-300 hover:shadow-md md:p-5"
          >
            <h2 title={invite.name} className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg">
              {invite.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You were added as an owner or operator. Complete your details to finish this application.
            </p>
            {invite.invitedAt && (
              <p className="mt-1 text-xs text-gray-500">
                Invited{" "}
                {new Date(invite.invitedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}

            <div className="mt-auto flex justify-end border-t border-gray-100 pt-4">
              <Button
                label="Complete my details"
                className="w-full sm:w-auto"
                onClick={() =>
                  navigate(`/hidden/${invite.formId}/${invite.sectionKey}?token=${encodeURIComponent(invite.token)}`)
                }
                style={{
                  backgroundColor: colors?.primary,
                  borderColor: colors?.primary,
                  color: colors?.buttonTextPrimary,
                  transition: "all 0.3s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OwnerInvitations;
