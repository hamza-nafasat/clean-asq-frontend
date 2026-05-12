import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import { useGetFormVersionsQuery } from "@/redux/apis/formApis";
import DataTable from "react-data-table-component";
import { ThreeDotEditViewDelete } from "../shared/ThreeDotViewEditDelete";
import { Diff, Eye, History, MoreVertical, Trash } from "lucide-react";
import { createRef, useMemo, useRef, useState } from "react";
import { FieldChanges } from "./FieldChanges";
import { ApplicationPdfViewCommonProps } from "@/page/admin/userApplicationForms/ApplicationVerification/ApplicationPdfView";
import Modal from "../shared/small/Modal";

const ColumnsForFormVersions = () => [
  {
    name: "Date/Time",
    selector: (row) =>
      new Date(row?.updatedAt || "").toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    sortable: true,
    width: "200px",
  },
  {
    name: "User Name",
    selector: (row) => `${row?.actor?.name}`,
    sortable: true,
    width: "180px",
  },
  {
    name: "email",
    selector: (row) => `${row?.actor?.email}`,
    sortable: true,
    width: "250px",
  },
  {
    name: "Role",
    selector: (row) => `${row?.actor?.role}`,
    sortable: true,
    width: "100px",
  },
  {
    name: "Form Name",
    selector: (row) => row?.form?.name,
    sortable: true,
    width: "250px",
  },
  {
    name: "Version",
    selector: (row) => row?.version,
    sortable: true,
    width: "120px",
  },
  {
    name: "Fields Changed",
    selector: (row) => row?.diff?.length,
    sortable: true,
    wrap: true,
  },
];

const FormVersions = ({ submittedFormId }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  // const [deleteVersionModal, setDeleteVersionModal] = useState(false);
  const [fieldChanges, setFieldChanges] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const [actionMenu, setActionMenu] = useState(null);
  const { data: versioning, isLoading: isLoadingVersioning } = useGetFormVersionsQuery(
    { submittedFormId },
    { skip: !submittedFormId },
  );
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const ButtonsForThreeDot = useMemo(
    () => [
      {
        name: "Version Details",
        icon: <Eye size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedVersion(row);
          setViewDetailsModal(true);
          setActionMenu(null);
        },
      },
      {
        name: "Field Differences",
        icon: <Diff size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedVersion(row);
          setFieldChanges(true);
          setActionMenu(null);
        },
      },
    ],
    [],
  );

  const columns = useMemo(
    () => [
      ...ColumnsForFormVersions(),
      {
        name: "Action",
        cell: (row) => {
          if (!actionMenuRefs.current.has(row?._id)) actionMenuRefs.current.set(row?._id, createRef());
          const rowRef = actionMenuRefs.current.get(row?._id);
          return (
            <div className="relative" ref={rowRef}>
              <button
                onClick={() => setActionMenu((prevActionMenu) => (prevActionMenu === row?._id ? null : row?._id))}
                className="cursor-pointer rounded p-1 hover:bg-gray-100"
                aria-label="Actions"
              >
                <MoreVertical size={18} />
              </button>
              {actionMenu === row._id && <ThreeDotEditViewDelete buttons={ButtonsForThreeDot} row={row} />}
            </div>
          );
        },
      },
    ],
    [ButtonsForThreeDot, actionMenu],
  );

  return (
    <div>
      {fieldChanges && (
        <Modal
          title="Field Changes"
          isOpen={fieldChanges}
          onClose={() => setFieldChanges(null)}
          hideSaveButton={true}
          hideCancelButton={true}
        >
          <FieldChanges selectedVersion={selectedVersion} />
        </Modal>
      )}
      {viewDetailsModal && (
        <Modal
          width="min-w-[80vw] max-w-2xl"
          title="Version Details"
          isOpen={viewDetailsModal}
          onClose={() => setViewDetailsModal(null)}
          hideSaveButton={true}
          hideCancelButton={true}
        >
          <ViewDetailsModal selectedVersion={selectedVersion} />
        </Modal>
      )}
      <DataTable
        progressPending={isLoadingVersioning}
        data={versioning?.data || []}
        columns={columns}
        customStyles={tableStyles}
        highlightOnHover
        fixedHeader
        persistTableHead
        responsive
        noDataComponent="No History found"
        className="rounded-t-xl!"
      />
    </div>
  );
};

export { FormVersions };

const ViewDetailsModal = ({ selectedVersion }) => {
  return (
    <div className="flex w-full min-h-screen justify-center items-center">
      <ApplicationPdfViewCommonProps
        userId={selectedVersion?.actor?._id}
        pdfId={selectedVersion?.form?._id}
        className="rounded-lg!"
      />
    </div>
  );
};
