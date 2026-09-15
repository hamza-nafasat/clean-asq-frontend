import { useState } from "react";
import { GoCheckCircle, GoDatabase } from "react-icons/go";
import { IoShieldOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useCompanyLookupMutation, useCompanyVerificationMutation } from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import AppDataTable from "@/components/shared/AppDataTable";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import TextField from "@/components/shared/TextField";
import { LOOKUP_NOT_FOUND, LOOKUP_SOURCE_KEY, VERIFICATION_STATUSES } from "../utils/testing.constants";
import { getVerificationTableStyles } from "../utils/testing.utils";

const LOOKUP_COLUMNS = [
  { name: "Field", selector: (row) => row.name, sortable: true },
  { name: "Result", selector: (row) => row.result },
  { name: "Source", selector: (row) => row.source },
];

// pair each lookup source entry with its value entry
const buildLookupRows = (lookupData) => {
  const entries = Object.entries(lookupData);
  const sourceEntries = entries.filter(([key]) => key.includes(LOOKUP_SOURCE_KEY));
  const valueEntries = entries.filter(([key]) => !key.includes(LOOKUP_SOURCE_KEY));
  const rows = sourceEntries
    .map(([key, value]) => {
      const nameEntry = valueEntries.find(([k]) => key?.includes(k));
      if (value === LOOKUP_NOT_FOUND) return {};
      return {
        source: String(value).split(",")[0],
        name: nameEntry?.[0],
        result: nameEntry?.[1],
      };
    })
    .filter((item) => item.name !== undefined);
  return {
    rows,
    totalCount: sourceEntries.length,
    verifiedCount: valueEntries.length,
  };
};

const TestingCompanyLookup = ({ formId = null }) => {
  const [totalStrategies, setTotalStrategies] = useState(0);
  const [verifiedStrategies, setVerifiedStrategies] = useState(0);
  const [lookupRows, setLookupRows] = useState([]);
  const [form, setForm] = useState({ name: "", url: "" });
  const [apisRes, setApisRes] = useState({
    companyLookup: {},
    companyVerify: {},
  });
  const [verifyCompany, { isLoading: verifyCompanyLoading }] = useCompanyVerificationMutation();
  const [lookupCompany, { isLoading: lookupCompanyLoading }] = useCompanyLookupMutation();
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const tableStyles = getVerificationTableStyles({
    primaryColor,
    secondaryColor,
    textColor,
    backgroundColor,
  });

  const isBusy = verifyCompanyLoading || lookupCompanyLoading;
  const verification = apisRes?.companyVerify;

  const handleVerify = async () => {
    if (!form?.name || !form?.url) return toast.error("Please fill all fields");
    try {
      const companyVerifyRes = await verifyCompany({
        name: form?.name,
        url: form?.url,
        formId,
      }).unwrap();
      if (
        companyVerifyRes?.success &&
        companyVerifyRes?.data?.verificationStatus === VERIFICATION_STATUSES.UNVERIFIED
      ) {
        return toast.error(companyVerifyRes?.data?.error || "Company verification failed, please try again");
      }
      const lookupCompanyRes = await lookupCompany({
        name: form?.name,
        url: form?.url,
        formId,
      }).unwrap();
      if (companyVerifyRes?.success && lookupCompanyRes?.success) {
        setApisRes({
          companyLookup: lookupCompanyRes?.data,
          companyVerify: companyVerifyRes?.data,
        });
        const { rows, totalCount, verifiedCount } = buildLookupRows(lookupCompanyRes?.data?.lookupData);
        setTotalStrategies(totalCount);
        setVerifiedStrategies(verifiedCount);
        setLookupRows(rows);
        toast.success("Company verified successfully");
      }
    } catch (error) {
      console.error("Verify company error:", error);
      toast.error(error?.data?.message || "Failed to verify company");
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <section className="border-frameColor mt-5 w-full rounded-md border p-4">
        <header className="flex flex-col">
          <div className="flex items-center gap-2">
            <div>
              <IoShieldOutline className="font-medium text-blue-400" />
            </div>
            <h2 className="text-textPrimary text-xl font-medium">Company Verification</h2>
          </div>
          <p className="text-textPrimary text-xs">Verify that a company name and website URL belong together</p>
        </header>
        <div className="flex flex-col space-y-4">
          <TextField
            label={"Legal company name *"}
            className="w-full rounded px-2 text-sm"
            value={form.name}
            onChange={isBusy ? () => {} : (e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label={"Website URL *"}
            className="w-full rounded px-2 text-sm"
            value={form.url}
            onChange={isBusy ? () => {} : (e) => setForm({ ...form, url: e.target.value })}
          />
          {verification?.confidenceScore && verification?.verificationStatus && verification?.originalCompanyName ? (
            <div className="flex w-44 items-center gap-2 rounded-2xl border p-2 py-1">
              <div>
                <GoCheckCircle className="font-medium text-blue-400" />
              </div>
              <p className="text-textPrimary text-xs">
                {verification?.originalCompanyName} {verification?.verificationStatus} ({verification?.confidenceScore}
                %)
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-end">
            <Button
              label="Continue"
              onClick={handleVerify}
              disabled={isBusy}
              className={` ${isBusy && "cursor-not-allowed opacity-20"}`}
            />
          </div>
        </div>
      </section>
      {isBusy && <CustomLoading />}
      {lookupRows?.length && !isBusy ? (
        <section className="border-frameColor w-full space-y-4 rounded-md border p-4">
          <header className="flex items-center gap-3">
            <div>
              <GoCheckCircle className="font-medium text-blue-400" />
            </div>
            <h2 className="text-textPrimary text-xl font-medium">Company Information Collected</h2>
          </header>
          <div className="flex items-center justify-between">
            <p className="text-textPrimary text-sm">
              Collection rate: {apisRes?.companyLookup?.collectionRate}% ({verifiedStrategies}/{totalStrategies}{" "}
              successful)
            </p>
            <span className="border-frameColor rounded-2xl border p-1 text-xs font-medium">
              {totalStrategies} strategies
            </span>
          </div>
          <div className="p-4">
            <AppDataTable
              branded={false}
              title="Company Verification"
              columns={LOOKUP_COLUMNS}
              data={lookupRows}
              customStyles={tableStyles}
            />
          </div>
          <div className="border"></div>
          <footer className="flex items-center justify-between">
            <div className="text-textPrimary flex items-center gap-3">
              <div>
                <GoDatabase />
              </div>
              <p className="text-xs">Complete traceability: 2 search strategies attempted with full results</p>
            </div>
            <Button label={"Start Over"} />
          </footer>
        </section>
      ) : null}
    </div>
  );
};

export default TestingCompanyLookup;
