import Tabs from "@/components/shared/Tabs";
import { EXTRACTION_TAB_LIST } from "../utils/lookupManagement.constants";

const LookupManagementExtractionHeading = ({ lastUpdated = "", activeTab, onTabChange }) => (
  <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 className="text-textPrimary text-lg font-semibold">Manage Extraction Context</h2>
      <p className="text-textPrimary text-base">
        Configure the Perplexity AI prompt sections for intelligent data extraction
      </p>
      {lastUpdated && <p className="text-textPrimary text-sm opacity-80">Last updated: {lastUpdated}</p>}
    </div>
    <Tabs variant="pill" tabs={EXTRACTION_TAB_LIST} activeTab={activeTab} onTabChange={onTabChange} />
  </header>
);

export default LookupManagementExtractionHeading;
