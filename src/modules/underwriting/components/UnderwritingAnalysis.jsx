import { useMemo, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { useApplyRulesOnFormQuery } from "@/redux/apis/form.apis";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import Button from "@/components/shared/Button";
import AppDataTable from "@/components/shared/AppDataTable";
import { ALERT_CATEGORIES } from "../utils/underwriting.constants";

const buildAlertColumns = () => [
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
      <div className="text-textPrimary border-frameColor w-full resize-none rounded-md border p-2 text-sm">
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(row?.message) || "" }} />
        {row?.error && <span className="text-red-500 text-sm">{row?.error}</span>}
      </div>
    ),
    grow: 2,
    wrap: true,
  },
];

const numberRows = (rows) => rows.map((item, index) => ({ ...item, number: index + 1 }));

const UnderwritingAnalysis = ({ submitFormData = null }) => {
  const [isApplyingRules, setIsApplyingRules] = useState(false);
  const {
    data: alertsData,
    refetch: refetchAlertsData,
    isLoading: isLoadingAlertsData,
  } = useApplyRulesOnFormQuery(submitFormData?._id, {
    skip: !submitFormData?._id,
  });

  const filteredRules = useMemo(() => {
    const data = alertsData?.data || [];
    return {
      allDisplayAlertWithNumber: numberRows(data.filter((item) => item.category === ALERT_CATEGORIES.DISPLAY)),
      otherAllCategoryAlertWithNumber: numberRows(data.filter((item) => item.category !== ALERT_CATEGORIES.DISPLAY)),
    };
  }, [alertsData?.data]);

  const handleApplyRules = async () => {
    try {
      setIsApplyingRules(true);
      await refetchAlertsData(submitFormData?._id);
      setIsApplyingRules(false);
    } catch (error) {
      console.error("Apply rules error:", error);
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
      <div className="w-full gap-4 flex flex-col ">
        <section className="flex w-full flex-col gap-2 overflow-x-auto">
          <h2 className="text-textPrimary text-xl font-medium p-4">
            <span className="font-bold"> Key Application Info:</span> (section that contain all display rule output)
          </h2>
          <div className="w-full max-w-full">
            <AppDataTable
              data={filteredRules.allDisplayAlertWithNumber}
              columns={buildAlertColumns()}
              highlightOnHover
              progressPending={isLoadingAlertsData}
              noDataComponent="No key info yet"
              emptyDescription="Display rule results for this application will appear here."
              className="rounded-t-xl!"
            />
          </div>
        </section>
        <section className="flex w-full flex-col gap-2">
          <h2 className="text-textPrimary text-xl font-medium p-4">
            <span className="font-bold"> Application Alerts:</span> (section that contain all alert rule output)
          </h2>
          <div className="w-full max-w-full ">
            <AppDataTable
              data={filteredRules.otherAllCategoryAlertWithNumber}
              columns={buildAlertColumns()}
              highlightOnHover
              progressPending={isLoadingAlertsData}
              noDataComponent="No alerts yet"
              emptyDescription="Alert rule results for this application will appear here."
              className="rounded-t-xl!"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default UnderwritingAnalysis;
