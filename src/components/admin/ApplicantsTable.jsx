import { APPLICANT_STATUS } from "@/data/constants";
import { useDeleteSingleSubmitFormMutation } from "@/redux/apis/formApis";
import { ArrowRight, Eye, MoreVertical, Pencil, Trash, UserIcon } from "lucide-react";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import Modal from "../shared/Modal";
import TextField from "../shared/small/TextField";
import { ThreeDotEditViewDelete } from "../shared/ThreeDotViewEditDelete";
import ApplicantSearch from "./ApplicantSearch";
import { useSelector } from "react-redux";
import checkPermission, { webPermissions } from "@/utils/checkPermission";
// Table columns configuration
const APPLICANT_TABLE_COLUMNS = [
  {
    name: "ID",
    selector: (row) => row?._id?.slice(0, 3),
    sortable: true,
    width: "100px",
  },
  {
    name: "Name",
    selector: (row) => `${row?.user?.firstName} ${row?.user?.lastName}`,
    sortable: true,
    width: "170px",
  },
  {
    name: "Application",
    selector: (row) => row?.form?.name || "N/A",
    sortable: true,
    width: "180px",
  },
  {
    name: "Email",
    selector: (row) => row?.user?.email,
    sortable: true,
    width: "200px",
  },
  {
    name: "Client Type",
    selector: (row) => row?.user?.role?.name,
    sortable: true,
    width: "140px",
    cell: (row) => (
      <span className="text-accent w-[130px] rounded-sm bg-gray-100 px-2.5 py-[3px] text-center text-xs font-bold capitalize">
        {row?.user?.role?.name}
      </span>
    ),
  },
  {
    name: "Submitted Date",
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
    name: "Status",
    selector: (row) => row?.status,
    sortable: true,
    width: "150px",
    cell: (row) => (
      <span
        className={`w-[100px] rounded-sm px-2.5 py-[3px] text-center font-bold capitalize ${row.status === APPLICANT_STATUS.APPROVED ? "bg-[#34C7591A] text-[#34C759]" : ""
          } ${row.status === APPLICANT_STATUS.REJECTED ? "bg-[#FF3B301A] text-[#FF3B30]" : ""} ${row.status === APPLICANT_STATUS.PENDING ? "bg-yellow-100 text-yellow-800" : ""
          } ${row.status === APPLICANT_STATUS.REVIEWING ? "bg-blue-100 text-blue-500" : ""}`}
      >
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    ),
  },
];

const ApplicantsTable = ({
  applicants,
  isLoading,
  onView,
  filters,
  onFilterChange,
  setOpenSpecialAccess,
  setSelectedIdForSpecialAccessModal,
  setSelectedFormId
}) => {
  const navigate = useNavigate();
  const [actionMenu, setActionMenu] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editModalData, setEditModalData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [deleteSubmitForm, { isLoading: isLoadingDelete }] = useDeleteSingleSubmitFormMutation();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const actionMenuRefs = useRef(new Map());

  const { user } = useSelector((state) => state.auth);
  const hasUnderwritingPermission = checkPermission(user, webPermissions.underwriting);
  // Get unique clients for quick filters
  const uniqueClients = useMemo(() => {
    return [...new Set(applicants.map((applicant) => applicant?.user?.role?.name))];
  }, [applicants]);

  const handleDeleteApplicant = useCallback(async () => {
    try {
      if (!deleteConfirmation) return;
      console.log("delete confirmation", deleteConfirmation);
      const res = await deleteSubmitForm({ _id: deleteConfirmation }).unwrap();
      if (res.success) {
        toast.success(res?.message);
        setDeleteConfirmation(null);
        setActionMenu(null);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error(error?.data?.message || "Failed to delete application");
    }
  }, [deleteConfirmation, deleteSubmitForm]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleEditApplicant = useCallback(async () => {
    // Basic validation
    const errors = {};
    if (!editModalData.name.trim()) errors.name = "Name is required";
    if (!editModalData.email.trim()) errors.email = "Email is required";
    if (!editModalData.application.trim()) errors.application = "Application is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Here you would typically make an API call to update the applicant
    // For now, we'll just close the modal
    setEditModalData(null);
    setFormErrors({});
  }, [editModalData]);

  const renderFormField = useCallback((field, value, onChange, type = "text", error = null, options = null) => {
    const labelText = field
      .split(/(?=[A-Z])/)
      .join(" ")
      .replace(/^\w/, (c) => c.toUpperCase());

    if (type === "select" && options) {
      return (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">{labelText}</label>
          <select
            name={field}
            value={value}
            onChange={onChange}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${error ? "border-red-500" : "border-gray-300"
              }`}
          >
            <option value="">Select {labelText}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <TextField
          label={labelText}
          name={field}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${labelText}`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }, []);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesDateRange =
        (!filters.dateRange.start || applicant?.createdAt >= filters.dateRange.start) &&
        (!filters.dateRange.end || applicant?.createdAt <= filters.dateRange.end);
      const matchesStatus = !filters?.status || applicant?.status === filters?.status;
      const matchesSearch =
        !searchTerm || applicant?.user?.tole?.name?.toLowerCase().includes(searchTerm?.toLowerCase());
      const name = applicant?.user?.firstName + " " + applicant?.user?.lastName;
      const matchesName = !filters?.name || name?.toLowerCase().includes(filters.name.toLowerCase());

      return matchesDateRange && matchesStatus && matchesSearch && matchesName;
    });
  }, [applicants, filters, searchTerm]);

  const ButtonsForThreeDot = useMemo(
    () => [
      {
        name: "View Pdf",
        icon: <Eye size={16} className="mr-2" />,
        onClick: (row) => {
          onView(row.id);
          setActionMenu(null);
        },
      },
      {
        name: "Delete",
        icon: <Trash size={16} className="mr-2" />,
        onClick: (row) => {
          setDeleteConfirmation(row?._id);
        },
      },
      {
        name: "Forward a form",
        icon: <ArrowRight size={16} className="mr-2" />,
        onClick: (row) => {
          console.log("row is ", row);
          setOpenSpecialAccess(true);
          setSelectedIdForSpecialAccessModal(row?._id);
          setSelectedFormId(row?.form?._id);
          setActionMenu(null);
        },
      },
      ...(hasUnderwritingPermission ? [{
        name: "Underwriting",
        icon: <UserIcon size={16} className="mr-2" />,
        onClick: (row) => {
          navigate(`/underwriting/${row?._id}`);
          setActionMenu(null);
        },
      }] : []),







    ],
    [hasUnderwritingPermission, onView, setOpenSpecialAccess, setSelectedIdForSpecialAccessModal, setSelectedFormId, navigate]
  );

  const columns = useMemo(
    () => [
      ...APPLICANT_TABLE_COLUMNS,
      {
        name: "Action",
        cell: (row) => {
          if (!actionMenuRefs.current.has(row?._id)) {
            actionMenuRefs.current.set(row?._id, React.createRef());
          }
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
    [ButtonsForThreeDot, actionMenu]
  );

  // Handle click outside for action menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        (ref) => !ref.current?.contains(event.target)
      );

      if (clickedOutsideAllMenus) {
        setActionMenu(null);
      }
    };

    if (actionMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenu]);

  return (
    <div>
      <ApplicantSearch onSearch={handleSearch} clients={uniqueClients} />

      <div className="mt-14 mb-4   grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          <TextField
            label={"Search by Name"}
            type="text"
            value={filters.name || ""}
            onChange={(e) => onFilterChange("name", e.target.value)}
            placeholder="Enter name to search..."
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <label className="text-textPrimary text-sm lg:text-base">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="border-frameColor mt-2 h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
          >
            <option value="">All Statuses</option>
            {Object.values(APPLICANT_STATUS).map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-12 md:col-span-4">
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label={"Start Date "}
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFilterChange("dateRange", { ...filters.dateRange, start: e.target.value })}
            />
            <TextField
              label={"End Date"}
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFilterChange("dateRange", { ...filters.dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 w-full  overflow-x-auto lg:w-[calc(100vw-350px)]! xl:w-full">
        <DataTable
          columns={columns}
          data={filteredApplicants}
          highlightOnHover
          progressPending={isLoading}
          noDataComponent="No applicants found"
          fixedHeader
          persistTableHead
          responsive
        />
      </div>

      {/* Edit Modal */}
      {editModalData && (
        <Modal
          title="Edit Applicant"
          onClose={() => {
            setEditModalData(null);
            setFormErrors({});
          }}
          onSave={handleEditApplicant}
          isLoading={isLoading}
        >
          {renderFormField(
            "name",
            editModalData.name,
            (e) => setEditModalData((prev) => ({ ...prev, name: e.target.value })),
            "text",
            formErrors.name
          )}
          {renderFormField(
            "email",
            editModalData.email,
            (e) => setEditModalData((prev) => ({ ...prev, email: e.target.value })),
            "email",
            formErrors.email
          )}
          {renderFormField(
            "application",
            editModalData.application,
            (e) => setEditModalData((prev) => ({ ...prev, application: e.target.value })),
            "text",
            formErrors.application
          )}
          {renderFormField(
            "status",
            editModalData.status,
            (e) => setEditModalData((prev) => ({ ...prev, status: e.target.value })),
            "select",
            formErrors.status,
            Object.values(APPLICANT_STATUS).map((status) => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1),
            }))
          )}
          {/* {renderFormField(
            'clientType',
            editModalData.clientType,
            e => setEditModalData(prev => ({ ...prev, clientType: e.target.value })),
            'select',
            formErrors.clientType,
            Object.entries(CLIENT_LABELS).map(([value, label]) => ({
              value,
              label,
            }))
          )} */}
        </Modal>
      )}
      <ConfirmationModal
        isOpen={deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteApplicant}
        title="Delete Submit Form"
        message={`Are you sure you want to delete this submit form?`}
        isLoading={isLoadingDelete}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 border-none hover:bg-red-600 text-white"
        cancelButtonText="Cancer"
      />
    </div>
  );
};

ApplicantsTable.propTypes = {
  applicants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      application: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      dateCreated: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      // clientType: PropTypes.oneOf(Object.values(CLIENT_TYPES)).isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
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

export default ApplicantsTable;
