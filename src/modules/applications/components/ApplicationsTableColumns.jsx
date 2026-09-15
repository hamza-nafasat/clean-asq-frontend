import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import ApplicationsCopyTooltip from "./ApplicationsCopyTooltip";
import { APPLICANT_STATUS, APPLICANT_TYPE } from "../utils/applications.constants";
import { formatDateTime, getFullName } from "../utils/applications.utils";

const PILL_CLASSES = "w-25 rounded-sm px-2.5 py-0.75 text-center font-bold capitalize";

const STATUS_STYLES = {
  [APPLICANT_STATUS.APPROVED]: "bg-[#34C7591A] text-[#34C759]",
  [APPLICANT_STATUS.REJECTED]: "bg-[#FF3B301A] text-[#FF3B30]",
  [APPLICANT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [APPLICANT_STATUS.REVIEWING]: "bg-blue-100 text-blue-500",
};

const renderStatus = (row) =>
  row?.type === APPLICANT_TYPE.SUBMITTED ? (
    <ApplicationsCopyTooltip
      id={row?.status}
      label={
        <span className={`${PILL_CLASSES} ${STATUS_STYLES[row.status] ?? ""}`}>
          {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
        </span>
      }
    />
  ) : (
    <ApplicationsCopyTooltip
      id={"Draft"}
      label={<span className={`${PILL_CLASSES} bg-yellow-100 text-yellow-800`}>Draft</span>}
    />
  );

const APPLICANT_TABLE_COLUMNS = [
  {
    name: "ID",
    selector: (row) => row?._id,
    sortable: true,
    width: "100px",
    cell: (row) => <ApplicationsCopyTooltip id={row?._id} />,
  },
  {
    name: "Name",
    selector: (row) => getFullName(row?.user),
    sortable: true,
    cell: (row) => <ApplicationsCopyTooltip id={getFullName(row?.user)} label={getFullName(row?.user)} />,
  },
  {
    name: "Application",
    selector: (row) => row?.form?.name || "N/A",
    sortable: true,
    cell: (row) => <ApplicationsCopyTooltip id={row?.form?.name || "N/A"} label={row?.form?.name || "N/A"} />,
  },
  {
    name: "Email",
    selector: (row) => row?.user?.email,
    sortable: true,
    wrap: true,
    cell: (row) => <ApplicationsCopyTooltip id={row?.user?.email} label={row?.user?.email} />,
  },
  {
    name: "Client Type",
    selector: (row) => row?.user?.role?.name,
    sortable: true,
    cell: (row) => (
      <ApplicationsCopyTooltip
        id={row?.user?.role?.name}
        label={
          <span className="text-accent w-32.5 rounded-sm bg-gray-100 px-2.5 py-0.75 text-center text-xs font-bold capitalize">
            {row?.user?.role?.name}
          </span>
        }
      />
    ),
  },
  {
    name: "Submitted Date",
    selector: (row) => formatDateTime(row?.updatedAt),
    sortable: true,
    cell: (row) => {
      const formatted = formatDateTime(row?.updatedAt);
      return <ApplicationsCopyTooltip id={formatted} label={formatted} />;
    },
  },
  {
    name: "Status",
    selector: (row) => row?.status,
    sortable: true,
    cell: renderStatus,
  },
];

export const buildApplicantColumns = ({ actionMenu, onToggleMenu, getRowRef, submittedButtons, draftButtons }) => [
  ...APPLICANT_TABLE_COLUMNS,
  {
    name: "Action",
    cell: (row) => (
      <RowActionMenuCell
        row={row}
        buttons={row?.type === APPLICANT_TYPE.SUBMITTED ? submittedButtons : draftButtons}
        isOpen={actionMenu === row._id}
        onToggle={() => onToggleMenu(row?._id)}
        rowRef={getRowRef(row?._id)}
        buttonClassName="cursor-pointer rounded p-1 hover:bg-gray-100"
      />
    ),
  },
];
