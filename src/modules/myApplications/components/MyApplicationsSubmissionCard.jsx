import { CiMenuKebab } from "react-icons/ci";
import ApplicationStatusPill from "@/components/global/ApplicationStatusPill";
import Button from "@/components/shared/Button";
import MyApplicationsStatusBadge from "./MyApplicationsStatusBadge";
import { SUBMISSION_TYPES } from "@/constants";
import { BRANDED_BUTTON_CLASS, CARD_CLASS } from "../utils/myApplications.constants";
import { buildBrandedButtonStyle, formatLongDate, getBeneficialOwners } from "../utils/myApplications.utils";

const MyApplicationsSubmissionCard = ({
  submission,
  canInviteOwner = false,
  isMenuOpen = false,
  menuRef,
  isDownloading = false,
  onToggleMenu,
  onInvite,
  onDownload,
}) => {
  const { totalOwners, filledOwners } = getBeneficialOwners(submission);

  return (
    <article className={CARD_CLASS}>
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 title={submission.name} className="truncate text-base leading-tight font-bold text-gray-800 sm:text-lg">
            {submission.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500">Submitted {formatLongDate(submission.submittedAt)}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <MyApplicationsStatusBadge status={SUBMISSION_TYPES.SUBMITTED} />
          {canInviteOwner && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Application actions"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                className="cursor-pointer rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                onClick={onToggleMenu}
              >
                <CiMenuKebab />
              </button>
              {isMenuOpen && (
                <div className="absolute top-9 right-0 z-10 w-52 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                  <Button
                    type="button"
                    label="Invite Owner"
                    variant="icon"
                    className="w-full p-2 text-sm"
                    onClick={onInvite}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Details */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-gray-500">Review status</dt>
          <dd className="mt-1">
            <ApplicationStatusPill status={submission.status} className="text-xs" />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-gray-500">Sections</dt>
          <dd className="font-medium text-gray-800">{submission.sections?.length ?? 0}</dd>
        </div>
        <div className="col-span-2 min-w-0">
          <dt className="text-xs text-gray-500">Beneficial owners</dt>
          <dd className="font-medium text-gray-800">
            {totalOwners.length ? `${filledOwners.length} of ${totalOwners.length} completed` : "No owners added"}
          </dd>
        </div>
      </dl>

      {/* Footer */}
      <footer className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          label="Download PDF"
          loading={isDownloading}
          onClick={onDownload}
          className={BRANDED_BUTTON_CLASS}
          style={buildBrandedButtonStyle(submission.branding?.colors)}
        />
      </footer>
    </article>
  );
};

export default MyApplicationsSubmissionCard;
