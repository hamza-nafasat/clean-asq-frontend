import { FiArrowRight, FiEye, FiSend, FiTrash2, FiUser } from "react-icons/fi";
import CopyableText from "@/components/shared/CopyableText";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import { SUBMISSION_TYPES } from "@/constants";
import { APPLICATION_STATUSES } from "./applications.constants";
import { capitalize, formatDateTime, getDisplayStatus, getFullName, isSubmitted } from "./applications.utils";

const PILL_CLASSES = "w-25 rounded-sm px-2.5 py-0.75 text-center font-bold capitalize";
const LINK_CLASSES = "text-blue-600 hover:text-blue-800";
const ID_PREVIEW_LENGTH = 6;

const STATUS_STYLES = {
  [APPLICATION_STATUSES.APPROVED]: "bg-green-100 text-green-600",
  [APPLICATION_STATUSES.REJECTED]: "bg-red-100 text-red-500",
  [APPLICATION_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
  [APPLICATION_STATUSES.REVIEWING]: "bg-blue-100 text-blue-500",
  [SUBMISSION_TYPES.DRAFT]: "bg-yellow-100 text-yellow-800",
};
const UNKNOWN_STATUS_STYLE = "bg-gray-100 text-gray-600";

const renderStatus = (row) => {
  const status = getDisplayStatus(row) ?? "";
  return (
    <CopyableText text={status}>
      <span className={`${PILL_CLASSES} ${STATUS_STYLES[status.toLowerCase()] ?? UNKNOWN_STATUS_STYLE}`}>
        {capitalize(status)}
      </span>
    </CopyableText>
  );
};

const renderCopyCell = (value) => <CopyableText text={value}>{value}</CopyableText>;

const APPLICATION_COLUMNS = [
  {
    name: "ID",
    selector: (row) => row._id,
    sortable: true,
    width: "100px",
    cell: (row) => (
      <CopyableText text={row._id} className={LINK_CLASSES}>
        …{row._id.slice(-ID_PREVIEW_LENGTH)}
      </CopyableText>
    ),
  },
  {
    name: "Name",
    selector: (row) => getFullName(row.user),
    sortable: true,
    cell: (row) => renderCopyCell(getFullName(row.user)),
  },
  {
    name: "Application",
    selector: (row) => row.form?.name || "N/A",
    sortable: true,
    cell: (row) => renderCopyCell(row.form?.name || "N/A"),
  },
  {
    name: "Email",
    selector: (row) => row.user?.email,
    sortable: true,
    wrap: true,
    cell: (row) => renderCopyCell(row.user?.email),
  },
  {
    name: "Client Type",
    selector: (row) => row.user?.role?.name,
    sortable: true,
    cell: (row) => (
      <CopyableText text={row.user?.role?.name}>
        <span className="text-accent w-32.5 rounded-sm bg-gray-100 px-2.5 py-0.75 text-center text-xs font-bold capitalize">
          {row.user?.role?.name}
        </span>
      </CopyableText>
    ),
  },
  {
    name: "Last Updated",
    selector: (row) => row.updatedAt,
    sortable: true,
    cell: (row) => renderCopyCell(formatDateTime(row.updatedAt)),
  },
  {
    name: "Status",
    selector: (row) => getDisplayStatus(row),
    sortable: true,
    cell: renderStatus,
  },
];

export const buildColumns = ({ openRowId, getRowRef, getRowButtons, onToggleMenu }) => [
  ...APPLICATION_COLUMNS,
  {
    name: "Action",
    cell: (row) => {
      const buttons = getRowButtons(row);
      if (!buttons.length) return null;
      return (
        <RowActionMenuCell
          row={row}
          buttons={buttons}
          isOpen={openRowId === row._id}
          onToggle={() => onToggleMenu(row._id)}
          rowRef={getRowRef(row._id)}
          buttonClassName="cursor-pointer rounded p-1 hover:bg-gray-100"
        />
      );
    },
  },
];

// the actions each row offers
export const buildRowButtons = ({ can, currentUserId, onView, onForward, onUnderwrite, onDelete, onContinue }) => {
  const deleteButton = can.delete && {
    name: "Delete",
    icon: <FiTrash2 size={16} className="mr-2" />,
    onClick: onDelete,
  };
  const submittedButtons = [
    { name: "View Pdf", icon: <FiEye size={16} className="mr-2" />, onClick: onView },
    deleteButton,
    can.share && { name: "Forward a Section", icon: <FiSend size={16} className="mr-2" />, onClick: onForward },
    can.underwrite && { name: "Underwriting", icon: <FiUser size={16} className="mr-2" />, onClick: onUnderwrite },
  ].filter(Boolean);
  const continueButton = { name: "Continue", icon: <FiArrowRight size={16} className="mr-2" />, onClick: onContinue };

  // only the owner can resume a draft
  return (row) => {
    if (isSubmitted(row)) return submittedButtons;
    const isOwnDraft = (row.user?._id ?? row.user) === currentUserId;
    return [deleteButton, can.continue && isOwnDraft && continueButton].filter(Boolean);
  };
};
