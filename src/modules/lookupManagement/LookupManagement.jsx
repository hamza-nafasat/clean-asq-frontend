import { useState } from "react";
import LookupManagementExtractionContext from "@/modules/lookupManagement/components/LookupManagementExtractionContext";
import LookupManagementTable from "@/modules/lookupManagement/components/LookupManagementTable";
import { LOOKUP_TAB_LIST, LOOKUP_TABS } from "@/modules/lookupManagement/utils/lookupManagement.constants";

const LookupManagement = () => {
  const [activeTab, setActiveTab] = useState(LOOKUP_TABS.STRATEGIES_KEY);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex space-x-2 bg-white/80 backdrop-blur-md border rounded-lg w-fit p-1.5 shadow-sm">
        {LOOKUP_TAB_LIST.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-primary text-white scale-105'
                : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {activeTab === LOOKUP_TABS.STRATEGIES_KEY ? <LookupManagementTable /> : <LookupManagementExtractionContext />}
      </div>
    </div>
  );
};

export default LookupManagement;
