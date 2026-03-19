import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import { useApplyRulesOnFormQuery } from "@/redux/apis/formApis";
import DataTable from "react-data-table-component";
import Button from "../shared/small/Button";
import { CgSpinner } from "react-icons/cg";
import { useState } from "react";

const columns = () => [
  {
    name: "Alert Name",
    selector: (row) => <span className="text-textPrimary font-semibold capitalize">{row?.ruleName}</span>,
    sortable: true,
    width: "200px",
  },
  {
    name: "Alert Message",
    selector: (row) => row?.message,
    sortable: true,
    cell: (row) => (
      <textarea
        value={row?.message}
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
];

const VerificationAndAlerts = ({ submitFormData }) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const [isApplyingRules, setIsApplyingRules] = useState(false);
  const { data: alertsData, refetch: refetchAlertsData } = useApplyRulesOnFormQuery(submitFormData?._id, {
    skip: !submitFormData?._id,
  });

  const handleApplyRules = async () => {
    try {
      setIsApplyingRules(true);
      await refetchAlertsData(submitFormData?._id);
      setIsApplyingRules(false);
    } catch (error) {
      console.error("Error applying rules:", error);
      setIsApplyingRules(false);
    }
  };

  return (
    <div className="flex w-full p-4 items-center justify-center gap-4 flex-col">
      <div className="flex w-full justify-end">
        <Button
          label="Apply Rules"
          variant="primary"
          onClick={handleApplyRules}
          disabled={isApplyingRules}
          cnLeft={isApplyingRules ? "animate-spin h-5 w-5" : ""}
          icon={isApplyingRules ? CgSpinner : undefined}
        />
      </div>
      <div className="w-full max-w-full ">
        <DataTable
          data={
            alertsData?.data
              ?.map((item) => ({ ...item, priority: Number(item?.priority) }))
              .sort((a, b) => b?.priority - a?.priority) || []
          }
          columns={columns()}
          customStyles={tableStyles}
          pagination
          highlightOnHover
          progressPending={false}
          noDataComponent="No History found"
          className="rounded-t-xl!"
        />
      </div>
    </div>
  );
};

export { VerificationAndAlerts };
