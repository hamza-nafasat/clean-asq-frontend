import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { ArrowRight, Eye, Trash, UserIcon } from "lucide-react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { useGetSavedFormMutation } from "@/redux/apis/form.apis";
import { addSavedFormData, setCurrentDraftId, updateEmailVerified } from "@/redux/slices/form.slice";
import usePermission from "@/hooks/usePermission";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import CustomLoading from "@/components/shared/CustomLoading";
import ApplicationsFilter from "./ApplicationsFilter";
import { buildApplicantColumns } from "./ApplicationsTableColumns";
import { PERMISSIONS } from "@/utils/permissions";
import { APPLICATIONS_ROUTES } from "../utils/applications.constants";
import { getFullName } from "../utils/applications.utils";

const emptyDeleteConfirmation = { id: null, type: null };

const ApplicationsTable = ({
  applicants = [],
  isLoading = false,
  isLoadingDelete = false,
  onView,
  onDeleteApplication,
  filters = {},
  onFilterChange,
  setOpenSpecialAccess,
  setSelectedIdForSpecialAccessModal,
  setSelectedFormId,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [actionMenu, setActionMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(emptyDeleteConfirmation);
  const actionMenuRefs = useRef(new Map());
  const [getSavedFormData] = useGetSavedFormMutation();
  const hasUnderwritingPermission = usePermission(PERMISSIONS.UNDERWRITING);

  // resume draft from where the applicant left off
  const continueDraftHandler = useCallback(
    async (row) => {
      const formId = row?.form?._id || row?.form;
      const draftId = row?._id;
      const brandingName = row?.form?.branding?.name;
      try {
        dispatch(updateEmailVerified(true));
        dispatch(setCurrentDraftId(draftId));
        const res = await getSavedFormData({ formId, draftId }).unwrap();
        const savedData = res?.data?.savedData || {};
        const action = await dispatch(addSavedFormData(savedData));
        unwrapResult(action);
        const brandingQuery = brandingName ? `&brandingName=${brandingName}` : "";
        if (!savedData?.company_lookup_data) {
          return navigate(`${APPLICATIONS_ROUTES.VERIFICATION}?formid=${formId}${brandingQuery}&draftId=${draftId}`);
        }
        return navigate(`${APPLICATIONS_ROUTES.APPLICATION_FORM}/${brandingName}/${formId}?draftId=${draftId}`);
      } catch (error) {
        console.error("Resume draft error:", error);
        return navigate(`${APPLICATIONS_ROUTES.VERIFICATION}?formid=${formId}&draftId=${draftId}`);
      }
    },
    [dispatch, getSavedFormData, navigate],
  );

  const handleDeleteApplicant = useCallback(async () => {
    try {
      if (!deleteConfirmation?.id || !deleteConfirmation?.type) return;
      await onDeleteApplication?.(deleteConfirmation);
      setDeleteConfirmation(emptyDeleteConfirmation);
      setActionMenu(null);
    } catch (error) {
      console.error("Delete application error:", error);
      toast.error(error?.data?.message || error?.message || "Failed to delete application");
    }
  }, [deleteConfirmation, onDeleteApplication]);

  const filteredApplicants = useMemo(
    () =>
      applicants?.filter((applicant) => {
        const matchesDateRange =
          (!filters?.dateRange?.start || applicant?.createdAt >= filters?.dateRange?.start) &&
          (!filters?.dateRange?.end || applicant?.createdAt <= filters?.dateRange?.end);
        const matchesStatus = !filters?.status || applicant?.status === filters?.status;
        const matchesSearch =
          !searchTerm || applicant?.user?.role?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase() || "");
        const name = getFullName(applicant?.user);
        const matchesName = !filters?.name || name?.toLowerCase()?.includes(filters?.name?.toLowerCase() || "");
        const matchesType = !filters?.type || applicant?.type === filters?.type;
        return matchesDateRange && matchesStatus && matchesSearch && matchesName && matchesType;
      }),
    [applicants, filters, searchTerm],
  );

  const draftButtons = useMemo(
    () => [
      {
        name: "Delete",
        icon: <Trash size={16} className="mr-2" />,
        onClick: (row) => {
          setDeleteConfirmation({ id: row?._id, type: row?.type });
          setActionMenu(null);
        },
      },
      {
        name: "Continue",
        icon: <ArrowRight size={16} className="mr-2" />,
        onClick: (row) => {
          setActionMenu(null);
          continueDraftHandler(row);
        },
      },
    ],
    [continueDraftHandler],
  );

  const submittedButtons = useMemo(
    () => [
      {
        name: "View Pdf",
        icon: <Eye size={16} className="mr-2" />,
        onClick: (row) => {
          onView?.(row);
          setActionMenu(null);
        },
      },
      {
        name: "Delete",
        icon: <Trash size={16} className="mr-2" />,
        onClick: (row) => {
          setDeleteConfirmation({ id: row?._id, type: row?.type });
          setActionMenu(null);
        },
      },
      {
        name: "Forward a form",
        icon: <ArrowRight size={16} className="mr-2" />,
        onClick: (row) => {
          setOpenSpecialAccess?.(true);
          setSelectedIdForSpecialAccessModal?.(row?._id);
          setSelectedFormId?.(row?.form?._id);
          setActionMenu(null);
        },
      },
      ...(hasUnderwritingPermission
        ? [
            {
              name: "Underwriting",
              icon: <UserIcon size={16} className="mr-2" />,
              onClick: (row) => {
                navigate(`${APPLICATIONS_ROUTES.UNDERWRITING}/${row?._id}`);
                setActionMenu(null);
              },
            },
          ]
        : []),
    ],
    [hasUnderwritingPermission, onView, setOpenSpecialAccess, setSelectedIdForSpecialAccessModal, setSelectedFormId, navigate],
  );

  const columns = useMemo(
    () => buildApplicantColumns({ actionMenu, setActionMenu, actionMenuRefs, submittedButtons, draftButtons }),
    [draftButtons, submittedButtons, actionMenu],
  );

  // close action menu on outside click
  useEffect(() => {
    if (actionMenu === null) return;
    const handleClickOutside = (event) => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        (ref) => !ref.current?.contains(event.target),
      );
      if (clickedOutsideAllMenus) setActionMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenu]);

  return (
    <div>
      <ApplicationsFilter
        filters={filters}
        onFilterChange={onFilterChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div
        className="mt-5 w-full h-full overflow-x-auto lg:w-[calc(100vw-350px)]! xl:w-full"
        data-testid="applications-table"
      >
        <DataTable
          columns={columns}
          data={filteredApplicants}
          progressPending={isLoading}
          noDataComponent={
            <div className="flex items-center justify-center h-full flex-col gap-2 p-10">
              <h3 className="text-textPrimary text-xl font-bold">No applicants found</h3>
            </div>
          }
          progressPendingMessage={<CustomLoading className="w-10 h-10" />}
          highlightOnHover
          fixedHeader
          persistTableHead
          responsive
        />
      </div>
      <ConfirmationModal
        isOpen={deleteConfirmation?.id && deleteConfirmation?.type}
        onClose={() => setDeleteConfirmation(emptyDeleteConfirmation)}
        onConfirm={handleDeleteApplicant}
        title="Delete Submit Form"
        message={`Are you sure you want to delete this submit form?`}
        isLoading={isLoadingDelete}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

ApplicationsTable.propTypes = {
  applicants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      application: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      dateCreated: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onDeleteApplication: PropTypes.func,
  filters: PropTypes.shape({
    dateRange: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
    status: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default ApplicationsTable;
