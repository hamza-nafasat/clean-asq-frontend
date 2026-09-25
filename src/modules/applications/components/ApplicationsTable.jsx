import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { ArrowRight, Eye, Trash, UserIcon } from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useGetSavedFormMutation } from "@/redux/apis/form.apis";
import { addSavedFormData, setCurrentDraftId, updateEmailVerified } from "@/redux/slices/form.slice";
import useDeleteConfirmation from "@/hooks/useDeleteConfirmation";
import useRowActionMenu from "@/hooks/useRowActionMenu";
import usePermission from "@/hooks/usePermission";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import AppDataTable from "@/components/shared/AppDataTable";
import CustomLoading from "@/components/shared/CustomLoading";
import ApplicationsFilter from "./ApplicationsFilter";
import { buildApplicantColumns } from "./ApplicationsTableColumns";
import { PERMISSIONS } from "@/utils/permissions";
import { APPLICANT_TYPE, APPLICATIONS_ROUTES } from "../utils/applications.constants";
import { getFullName } from "../utils/applications.utils";

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
  const {
    openRowId: actionMenu,
    setOpenRowId: setActionMenu,
    toggleMenu,
    getRowRef,
  } = useRowActionMenu({
    closeOnOutsideClick: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [getSavedFormData] = useGetSavedFormMutation();
  const user = useSelector((state) => state.auth.user);
  const canUnderwrite = usePermission(PERMISSIONS.UNDERWRITING);
  const canDeleteApplication = usePermission(PERMISSIONS.DELETE_APPLICATION);
  const canShareApplication = usePermission(PERMISSIONS.SHARE_APPLICATION);
  const canSubmitForm = usePermission(PERMISSIONS.SUBMIT_FORM);

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

  const {
    target: deleteConfirmation,
    openConfirmation: setDeleteConfirmation,
    closeConfirmation,
    handleConfirm: handleDeleteApplicant,
  } = useDeleteConfirmation({
    onDelete: async (target) => {
      try {
        if (!target?.id || !target?.type) return;
        await onDeleteApplication?.(target);
        setActionMenu(null);
        return true;
      } catch (error) {
        console.error("Delete application error:", error);
        toast.error(error?.data?.message || error?.message || "Failed to delete application");
      }
    },
  });

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

  const deleteButton = useMemo(
    () => ({
      name: "Delete",
      icon: <Trash size={16} className="mr-2" />,
      onClick: (row) => {
        setDeleteConfirmation({ id: row?._id, type: row?.type });
        setActionMenu(null);
      },
    }),
    [setDeleteConfirmation, setActionMenu],
  );

  const continueButton = useMemo(
    () => ({
      name: "Continue",
      icon: <ArrowRight size={16} className="mr-2" />,
      onClick: (row) => {
        setActionMenu(null);
        continueDraftHandler(row);
      },
    }),
    [continueDraftHandler, setActionMenu],
  );

  const submittedButtons = useMemo(
    () =>
      [
        {
          name: "View Pdf",
          icon: <Eye size={16} className="mr-2" />,
          onClick: (row) => {
            onView?.(row);
            setActionMenu(null);
          },
        },
        canDeleteApplication && deleteButton,
        canShareApplication && {
          name: "Forward a form",
          icon: <ArrowRight size={16} className="mr-2" />,
          onClick: (row) => {
            setOpenSpecialAccess?.(true);
            setSelectedIdForSpecialAccessModal?.(row?._id);
            setSelectedFormId?.(row?.form?._id);
            setActionMenu(null);
          },
        },
        canUnderwrite && {
          name: "Underwriting",
          icon: <UserIcon size={16} className="mr-2" />,
          onClick: (row) => {
            navigate(`${APPLICATIONS_ROUTES.UNDERWRITING}/${row?._id}`);
            setActionMenu(null);
          },
        },
      ].filter(Boolean),
    [
      canUnderwrite,
      canDeleteApplication,
      canShareApplication,
      deleteButton,
      onView,
      setOpenSpecialAccess,
      setSelectedIdForSpecialAccessModal,
      setSelectedFormId,
      navigate,
      setActionMenu,
    ],
  );

  // only the owner can resume a draft
  const getRowButtons = useCallback(
    (row) => {
      if (row?.type === APPLICANT_TYPE.SUBMITTED) return submittedButtons;
      const isOwnDraft = (row?.user?._id || row?.user) === user?._id;
      return [canDeleteApplication && deleteButton, canSubmitForm && isOwnDraft && continueButton].filter(Boolean);
    },
    [submittedButtons, canDeleteApplication, deleteButton, canSubmitForm, continueButton, user?._id],
  );

  const columns = useMemo(
    () => buildApplicantColumns({ actionMenu, onToggleMenu: toggleMenu, getRowRef, getRowButtons }),
    [getRowButtons, actionMenu, getRowRef, toggleMenu],
  );

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
        <AppDataTable
          branded={false}
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
          pagination
        />
      </div>
      <ConfirmationModal
        isOpen={deleteConfirmation?.id && deleteConfirmation?.type}
        onClose={closeConfirmation}
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
