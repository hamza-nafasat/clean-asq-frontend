import { useNavigate } from "react-router-dom";
import Button from "@/components/shared/Button";
import { CARD_CLASS } from "../utils/myApplications.constants";
import {
  buildBrandedButtonStyle,
  buildOwnerInvitationPath,
  formatLongDate,
} from "../utils/myApplications.utils";

// owner forms the user was invited to complete
const MyApplicationsOwnerInvitations = ({ invitations = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
      {invitations.map((invite) => (
        <div key={`${invite.formId}-${invite.sectionKey}`} className={CARD_CLASS}>
          <h2 title={invite.name} className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg">
            {invite.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You were added as an owner or operator. Complete your details to finish this application.
          </p>
          {invite.invitedAt && (
            <p className="mt-1 text-xs text-gray-500">Invited {formatLongDate(invite.invitedAt)}</p>
          )}

          <div className="mt-auto flex justify-end border-t border-gray-100 pt-4">
            <Button
              type="button"
              label="Complete my details"
              className="w-full sm:w-auto"
              onClick={() => navigate(buildOwnerInvitationPath(invite))}
              style={buildBrandedButtonStyle(invite?.branding?.colors)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyApplicationsOwnerInvitations;
