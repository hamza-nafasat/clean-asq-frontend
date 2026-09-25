import { useMemo, useState } from "react";
import { Diff, Eye } from "lucide-react";
import { useGetFormVersionsQuery } from "@/redux/apis/form.apis";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import Modal from "@/components/shared/Modal";
import AppDataTable from "@/components/shared/AppDataTable";
import RowActionMenuCell from "@/components/shared/RowActionMenuCell";
import UnderwritingFieldChanges from "./UnderwritingFieldChanges";
import UnderwritingVersionDetails from "./UnderwritingVersionDetails";
import { buildVersionColumns } from "../utils/underwriting.utils";

const UnderwritingFormVersions = ({ submittedFormId = "", submitForm = null }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [fieldChanges, setFieldChanges] = useState(null);
  const { openRowId: actionMenu, setOpenRowId, toggleMenu } = useRowActionMenu();
  const { data: versioning, isLoading: isLoadingVersioning } = useGetFormVersionsQuery(
    { submittedFormId },
    { skip: !submittedFormId },
  );

  const menuButtons = useMemo(
    () => [
      {
        name: "Version Details",
        icon: <Eye size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedVersion(row);
          setViewDetailsModal(true);
          setOpenRowId(null);
        },
      },
      {
        name: "Field Differences",
        icon: <Diff size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedVersion(row);
          setFieldChanges(true);
          setOpenRowId(null);
        },
      },
    ],
    [setOpenRowId],
  );

  const columns = useMemo(
    () => [
      ...buildVersionColumns(),
      {
        name: "Action",
        cell: (row) => (
          <RowActionMenuCell
            row={row}
            buttons={menuButtons}
            isOpen={actionMenu === row._id}
            onToggle={() => toggleMenu(row?._id)}
            buttonClassName="cursor-pointer rounded p-1 hover:bg-gray-100"
          />
        ),
      },
    ],
    [menuButtons, actionMenu, toggleMenu],
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
        <AppDataTable
          progressPending={isLoadingVersioning}
          data={versioning?.data || []}
          columns={columns}
          highlightOnHover
          fixedHeader
          persistTableHead
          responsive
          noDataComponent="No form versions yet"
          emptyDescription="Saved versions of this application form will appear here."
          className="rounded-t-xl!"
        />
      </div>
    </div>
  );
};

export default UnderwritingFormVersions;
