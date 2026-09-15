import { useState } from "react";
import Tabs from "@/components/shared/Tabs";
import LookupManagementExtractionContext from "@/modules/lookupManagement/components/LookupManagementExtractionContext";
import LookupManagementTable from "@/modules/lookupManagement/components/LookupManagementTable";
import { LOOKUP_TAB_LIST, LOOKUP_TABS } from "@/modules/lookupManagement/utils/lookupManagement.constants";

const LookupManagement = () => {
  const [activeTab, setActiveTab] = useState(LOOKUP_TABS.STRATEGIES_KEY);

  return (
    <div className="w-full">
      {/* Tabs */}
      <Tabs
        variant="pill"
        tabs={LOOKUP_TAB_LIST.map((tab) => ({ value: tab.id, label: tab.label }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-5">
        {activeTab === LOOKUP_TABS.STRATEGIES_KEY ? <LookupManagementTable /> : <LookupManagementExtractionContext />}
      </div>
    </div>
  );
};

export default LookupManagement;
