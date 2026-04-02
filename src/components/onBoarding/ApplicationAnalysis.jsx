import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import { useApplyRulesOnFormQuery } from "@/redux/apis/formApis";
import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { CgSpinner } from "react-icons/cg";
import Button from "../shared/small/Button";

const columns = () => [
  { name: "Rule No", selector: (row) => row?.number, sortable: true, width: "110px" },
  {
    name: "Alert Name",
    selector: (row) => <span className="text-textPrimary font-semibold capitalize">{row?.name}</span>,
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
];

const ApplicationAnalysis = ({ submitFormData }) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const [isApplyingRules, setIsApplyingRules] = useState(false);
  const { data: alertsData, refetch: refetchAlertsData } = useApplyRulesOnFormQuery(submitFormData?._id, {
    skip: !submitFormData?._id,
  });

  const filteredRules = useMemo(() => {
    const data = alertsData?.data || [];
    const allDisplayAlertWithNumber = data
      ?.filter((item) => item.category === "display")
      ?.map((item, index) => ({ ...item, number: index + 1 }));
    const otherAllCategoryAlertWithNumber = data
      .filter((item) => item.category !== "display")
      ?.map((item, index) => ({ ...item, number: index + 1 }));
    return {
      allDisplayAlertWithNumber,
      otherAllCategoryAlertWithNumber,
    };
  }, [alertsData?.data]);

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
    <div className="flex w-full p-2 items-center justify-center gap-4 flex-col">
      <div className="flex w-full justify-end gap-2">
        <Button
          label="Apply Rules"
          variant="primary"
          onClick={handleApplyRules}
          disabled={isApplyingRules}
          cnLeft={isApplyingRules ? "animate-spin h-5 w-5" : ""}
          icon={isApplyingRules ? CgSpinner : undefined}
        />
      </div>
      {/* if on tab or mobile then flex col else flex row  */}
      <div className="w-full gap-4 flex flex-col ">
        <div className="flex w-full flex-col gap-2 overflow-x-auto">
          <h1 className="text-textPrimary text-xl font-medium p-4">
            <span className="font-bold"> Key Application Info:</span> (section that contain all display rule output)
          </h1>
          <div className="w-full max-w-full">
            <DataTable
              data={filteredRules.allDisplayAlertWithNumber}
              columns={columns()}
              customStyles={tableStyles}
              highlightOnHover
              progressPending={false}
              noDataComponent="No History found"
              className="rounded-t-xl!"
            />
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          <h1 className="text-textPrimary text-xl font-medium p-4">
            <span className="font-bold"> Application Alerts:</span> (section that contain all alert rule output)
          </h1>
          <div className="w-full max-w-full ">
            <DataTable
              data={filteredRules.otherAllCategoryAlertWithNumber}
              columns={columns()}
              customStyles={tableStyles}
              highlightOnHover
              progressPending={false}
              noDataComponent="No History found"
              className="rounded-t-xl!"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ApplicationAnalysis };
