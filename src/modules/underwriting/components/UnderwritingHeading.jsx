import { Link } from "react-router-dom";
import PageHeading from "@/components/global/PageHeading";
import { FiArrowLeft } from "react-icons/fi";
import ApplicationStatusPill from "@/components/global/ApplicationStatusPill";
import { LAYOUT_ROUTES } from "@/constants";
import { formatDateTime } from "@/utils/date";

const UnderwritingHeading = ({ submission = null }) => {
  const applicantName = [submission?.user?.firstName, submission?.user?.lastName].filter(Boolean).join(" ");

  return (
    <header className="mb-5 flex flex-col gap-3">
      <Link
        to={LAYOUT_ROUTES.APPLICATIONS}
        className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <FiArrowLeft size={16} />
        Back to Applications
      </Link>
      <PageHeading
        title="Underwriting"
        description={`${applicantName || submission?.user?.email || ""} · ${submission?.form?.name || ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>Submitted {formatDateTime(submission?.createdAt)}</span>
            <span>Updated {formatDateTime(submission?.updatedAt)}</span>
            <ApplicationStatusPill status={submission?.status} className="text-sm" />
          </div>
        }
      />
    </header>
  );
};

export default UnderwritingHeading;
