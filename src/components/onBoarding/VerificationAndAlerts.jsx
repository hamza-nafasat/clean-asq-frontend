import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import { useApplyRulesOnFormQuery } from "@/redux/apis/formApis";
import DataTable from "react-data-table-component";
import Button from "../shared/small/Button";

const columns = () => [
  {
    name: "Alert Name",
    selector: (row) => row?.ruleName,
    sortable: true,
  },
  // {
  //   name: "Alert Message",
  //   selector: (row) => row?.message,
  //   sortable: true,
  //   wrap: true,
  // },
  {
    name: "Field Value",
    selector: (row) => row?.fieldValue,
    sortable: true,
  },
  {
    name: "Rule Value",
    selector: (row) => row?.ruleValue,
    sortable: true,
  },
  {
    name: "Full Path",
    selector: (row) => row?.fullPath,
    sortable: true,
  },
  {
    name: "Section",
    selector: (row) => row?.section,
    sortable: true,
  },
  {
    name: "Operator",
    selector: (row) => row?.operator,
    sortable: true,
  },
  {
    name: "Unique ID",
    selector: (row) => row?.uniqueId,
    sortable: true,
  },
];

const VerificationAndAlerts = ({ submitFormData }) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const { data: alertsData, refetch: refetchAlertsData } = useApplyRulesOnFormQuery(submitFormData?._id, {
    skip: !submitFormData?._id,
  });

  console.log(alertsData);
  console.log(submitFormData);

  return (
    <div className="flex w-full p-4 items-center justify-center gap-4 flex-col">
      <div className="flex w-full justify-end">
        <Button label="Apply Rules" variant="primary" onClick={() => refetchAlertsData(submitFormData?._id)} />
      </div>
      <div className="w-full max-w-full ">
        <DataTable
          data={alertsData?.data || []}
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
