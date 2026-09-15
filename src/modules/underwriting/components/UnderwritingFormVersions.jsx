import { createRef, useMemo, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { Diff, Eye, MoreVertical } from "lucide-react";
import { useGetFormVersionsQuery } from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import Modal from "@/components/shared/Modal";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";
import UnderwritingFieldChanges from "./UnderwritingFieldChanges";
import UnderwritingVersionDetails from "./UnderwritingVersionDetails";
import { getTableStyles } from "@/utils/tableStyles";
import { buildVersionColumns } from "../utils/underwriting.utils";

const UnderwritingFormVersions = ({ submittedFormId = "", submitForm = null }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [fieldChanges, setFieldChanges] = useState(null);
  const actionMenuRefs = useRef(new Map());
  const [actionMenu, setActionMenu] = useState(null);
  const { data: versioning, isLoading: isLoadingVersioning } = useGetFormVersionsQuery(
    { submittedFormId },
    { skip: !submittedFormId },
  );
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const menuButtons = useMemo(
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
      ...buildVersionColumns(),
      {
        name: "Action",
        cell: (row) => {
          if (!actionMenuRefs.current.has(row?._id)) actionMenuRefs.current.set(row?._id, createRef());
          const rowRef = actionMenuRefs.current.get(row?._id);
          return (
            <div className="relative" ref={rowRef}>
              <button
                type="button"
                onClick={() => setActionMenu((prevActionMenu) => (prevActionMenu === row?._id ? null : row?._id))}
                className="cursor-pointer rounded p-1 hover:bg-gray-100"
                aria-label="Actions"
              >
                <MoreVertical size={18} />
              </button>
              {actionMenu === row._id && <ThreeDotEditViewDelete buttons={menuButtons} row={row} />}
            </div>
          );
        },
      },
    ],
    [menuButtons, actionMenu],
  );

  const handleCloseDetails = () => {
    setViewDetailsModal(false);
    setSelectedVersion(null);
  };

  return (
    <div className="w-full overflow-x-auto">
      {fieldChanges && (
        <Modal
          title="Field Changes"
          isOpen={fieldChanges}
          onClose={() => setFieldChanges(null)}
          hideSaveButton={true}
          hideCancelButton={true}
        >
          <UnderwritingFieldChanges selectedVersion={selectedVersion} />
        </Modal>
      )}
      {viewDetailsModal && (
        <Modal
          width="min-w-[75vw] max-w-2xl"
          title="Version Details"
          isOpen={viewDetailsModal}
          onClose={handleCloseDetails}
          hideSaveButton={true}
          hideCancelButton={true}
        >
          <UnderwritingVersionDetails
            key={selectedVersion?._id}
            selectedVersion={selectedVersion}
            submitForm={submitForm}
          />
        </Modal>
      )}
      <div className="w-full overflow-x-auto">
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
    </div>
  );
};

export default UnderwritingFormVersions;
