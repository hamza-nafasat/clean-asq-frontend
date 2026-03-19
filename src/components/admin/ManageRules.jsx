import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import {
  useCreateFormRuleMutation,
  useDeleteSingleFormRuleMutation,
  useGetAllFormRulesQuery,
  useUpdateStatusSingleFormRuleMutation,
} from "@/redux/apis/formApis";
import { MoreVertical, PencilIcon, ToggleRight, Trash } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { FaSpinner } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../shared/ConfirmationModal";
import Button from "../shared/small/Button";
import CustomLoading from "../shared/small/CustomLoading";
import Modal from "../shared/small/Modal";
import TextField from "../shared/small/TextField";
import { ThreeDotEditViewDelete } from "../shared/ThreeDotViewEditDelete";

const manageRulesColumns = () => [
  {
    name: "Rule Id",
    sortable: true,
    width: "100px",
    cell: (row) => (
      <span title={row?._id} className="text-textPrimary truncate text-sm">
        {row?._id}
      </span>
    ),
  },
  {
    name: "Rule Name",
    sortable: true,
    cell: (row) => <span className="text-textPrimary font-semibold capitalize">{row?.ruleName}</span>,
    width: "200px",
  },
  {
    name: "Rule Prompt",
    sortable: true,
    cell: (row) => (
      <textarea
        value={row?.rulePrompt}
        readOnly
        className="text-textPrimary border-frameColor w-full resize-none rounded-md border bg-[#FAFBFF] p-2 text-sm"
        rows={2}
      />
    ),
    grow: 2,
    wrap: true,
  },
  {
    name: "Rule Priority",
    sortable: true,
    width: "150px",
    cell: (row) => (
      <span
        className={`px-4 py-2 w-25 text-center rounded-sm font-semibold capitalize text-white ${row?.priority === 0 ? "bg-green-500!" : row?.priority === 1 ? "bg-yellow-500!" : "bg-red-500!"}`}
      >
        {row?.priority === 0 ? "Low" : row?.priority === 1 ? "Medium" : "High"}
      </span>
    ),
  },
  {
    name: "Status",
    width: "120px",
    sortable: true,
    cell: (row) => <span className="font-semibold capitalize">{row?.isActive ? "Active" : "Inactive"}</span>,
  },
];

const ManageRules = () => {
  const formId = useParams().formId;
  const actionMenuRefs = useRef(new Map());
  const [actionMenu, setActionMenu] = useState(null);
  const [openCreateRuleModal, setOpenCreateRuleModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteRuleConfirmation, setDeleteRuleConfirmation] = useState(null);
  const [updateStatusRuleConfirmation, setUpdateStatusRuleConfirmation] = useState(null);
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const { data: rules, isLoading, refetch } = useGetAllFormRulesQuery({ formId });
  const [deleteRule, { isLoading: isDeletingRule }] = useDeleteSingleFormRuleMutation();
  const [updateStatusRule, { isLoading: isUpdatingStatusRule }] = useUpdateStatusSingleFormRuleMutation();

  const handleDeleteRule = async (ruleId) => {
    try {
      const res = await deleteRule({ ruleId }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || "Rule deleted successfully");
        await refetch();
        setDeleteRuleConfirmation(null);
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error(error?.data?.message || "Failed to delete rule");
    }
  };
  const handleUpdateStatusRule = async (ruleId, isActive) => {
    try {
      const res = await updateStatusRule({ ruleId, isActive: !isActive }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || "Rule status updated successfully");
        await refetch();
        setUpdateStatusRuleConfirmation(null);
      }
    } catch (error) {
      console.error("Error updating status rule:", error);
      toast.error(error?.data?.message || "Failed to update status rule");
    }
  };

  const ButtonsForThreeDot = useMemo(
    () => [
      {
        name: "Update Status",
        icon: <ToggleRight size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setUpdateStatusRuleConfirmation(true);
        },
      },
      {
        name: "Delete",
        icon: <Trash size={16} className="mr-2" />,
        onClick: (row) => {
          setSelectedRow(row);
          setActionMenu(null);
          setDeleteRuleConfirmation(true);
        },
      },
    ],
    [],
  );

  const columns = useMemo(
    () => [
      ...manageRulesColumns(),
      {
        name: "Action",
        width: "100px",
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
    [ButtonsForThreeDot, actionMenu],
  );
  if (isLoading) return <CustomLoading />;
  return (
    <>
      {openCreateRuleModal && (
        <Modal onClose={() => setOpenCreateRuleModal(false)}>
          <CreateRuleModal formId={formId} setModal={setOpenCreateRuleModal} refetch={refetch} />
        </Modal>
      )}

      <ConfirmationModal
        isOpen={!!deleteRuleConfirmation}
        onClose={() => setDeleteRuleConfirmation(null)}
        onConfirm={() => handleDeleteRule(selectedRow?._id)}
        title="Delete Rule"
        message={`Are you sure you want to delete this rule?`}
        isLoading={isDeletingRule}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />

      <ConfirmationModal
        isOpen={!!updateStatusRuleConfirmation}
        onClose={() => setUpdateStatusRuleConfirmation(null)}
        onConfirm={() => handleUpdateStatusRule(selectedRow?._id, selectedRow?.isActive)}
        isLoading={isUpdatingStatusRule}
        title="Update Status Rule"
        message={`Are you sure you want to update the status of this rule?`}
        confirmButtonText="Update"
        confirmButtonClassName="bg-red-500 text-white"
      />
      <div className="flex items-center justify-center p-4">
        <div className="flex w-full  flex-col gap-6">
          <div className="flex w-full justify-between gap-2">
            <h2 className="text-textPrimary text-xl font-semibold">Manage Rules</h2>
            <Button label="Create Rule" variant="primary" onClick={() => setOpenCreateRuleModal(true)} />
          </div>

          <div className="w-full max-w-full ">
            <DataTable
              data={rules?.data || []}
              columns={columns}
              customStyles={tableStyles}
              pagination
              highlightOnHover
              progressPending={false}
              noDataComponent="No Rules found"
              className="rounded-t-xl!"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageRules;

const CreateRuleModal = ({ formId, setModal, refetch }) => {
  const [prompt, setPrompt] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [createRule, { isLoading: isCreatingRule }] = useCreateFormRuleMutation();

  const createRuleHandler = async () => {
    try {
      if (!formId || !prompt || !ruleName) return toast.error("Please fill all the fields");
      const res = await createRule({ formId, prompt, ruleName }).unwrap();
      if (res?.success) {
        toast?.success(res?.message || "Rule created successfully");
        await refetch();
        setModal(false);
      }
    } catch (error) {
      console.error("Error creating rule:", error);
      toast.error(error?.data?.message || "Failed to create rule");
    }
  };
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h3 className="text-center text-lg font-semibold text-gray-800">Create Rule</h3>
        <div className="flex flex-col gap-2">
          <TextField
            label="Rule Name"
            id="rule-name"
            placeholder="Enter rule name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
          />
          <TextField
            label="Prompt"
            id="prompt"
            rows={5}
            cols={30}
            type="textarea"
            placeholder="Enter prompt for rule creation"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal(false)} />
          <Button
            label="Create Rule"
            variant="primary"
            icon={isCreatingRule && FaSpinner}
            cnLeft="mr-2 w-4 h-4 animate-spin"
            onClick={createRuleHandler}
            disabled={isCreatingRule}
          />
        </div>
      </div>
    </div>
  );
};
