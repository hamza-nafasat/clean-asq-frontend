import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import convertObjectToArray from "@/utils/convertObjectToArray";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Button from "../shared/small/Button";
import Checkbox from "../shared/small/Checkbox";

const columns = (setSubmitedData, activeTab) => [
  {
    name: "Key",
    selector: (row) => row?.key,
    sortable: true,
  },
  {
    name: "Value",
    selector: (row) => (typeof row?.value === "string" ? row?.value : JSON.stringify(row?.value)),
    sortable: true,
    wrap: true,
  },
  {
    name: "Verification value",
    selector: (row) => "",
    sortable: true,
    wrap: true,
  },
  {
    name: "Source",
    selector: (row) => row?.source,
    sortable: true,
    wrap: true,
  },
  {
    name: "Result",
    selector: (row) => {
      const checkbox = (
        <Checkbox
          checked={row?.result}
          onChange={(e) => {
            setSubmitedData((prev) =>
              prev.map((value) => {
                if (value?.[0] === activeTab) {
                  const findIndex = value.findIndex((item) => item?.key === row?.key);
                  if (findIndex !== -1) {
                    value[findIndex].result = e.target.checked;
                  }
                  return value;
                } else {
                  return value;
                }
              }),
            );
          }}
        />
      );
      return checkbox;
    },
  },
  {
    name: "Comment",
    selector: (row) => row?.comment || "",
  },
];

const VerificationAndAlerts = ({ data }) => {
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const [submitedData, setSubmitedData] = useState(data?.submitData);
  const [submitedDataKeys, setSubmitedDataKeys] = useState(Object.keys(submitedData));
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (data?.submitData) {
      const modifiedSubmittedData = Object.keys(data?.submitData).map((key) => {
        const updatedData = convertObjectToArray(data?.submitData[key], key);
        return updatedData;
      });
      setSubmitedData(modifiedSubmittedData);
    }
  }, [data?.submitData]);

  return (
    <div className="flex w-full p-4 items-center justify-center gap-4 flex-col">
      {/* button for verification section  */}
      <div className="flex gap-4 justify-between flex-wrap">
        {submitedDataKeys.map((key) => {
          if (key !== "company_lookup_data") {
            return (
              <Button
                key={key}
                label={key}
                variant={activeTab === key ? "primary" : "secondary"}
                className={`text-sm min-w-[240px]`}
                onClick={() => setActiveTab(key)}
              />
            );
          }
        })}
        <div className="w-full h-px bg-gray-400 my-4" />
      </div>
      {/* verification section  */}
      {activeTab && (
        <div className="w-full max-w-full ">
          <DataTable
            data={submitedData.find((value) => value?.[0] === activeTab)?.slice(1) || []}
            columns={columns(setSubmitedData, activeTab)}
            customStyles={tableStyles}
            pagination
            highlightOnHover
            progressPending={false}
            noDataComponent="No History found"
            className="rounded-t-xl!"
          />
        </div>
      )}
    </div>
  );
};

export { VerificationAndAlerts };
