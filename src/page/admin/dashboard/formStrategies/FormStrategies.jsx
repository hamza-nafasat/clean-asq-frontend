import AllFormsStrategies from '@/components/admin/AllFormsStrategies';
import React, { useState } from 'react';
import ExtractionContext from '../extractionContext/ExtractionContext';

function FormStrategies() {
  const [activeTab, setActiveTab] = useState('one');

  const tabs = [
    { id: 'one', label: 'Strategies Key' },
    { id: 'two', label: 'Extraction Prompt' },
  ];

  return (
    <div className="w-full">
      {/* Tabs aligned top-left */}
      <div className="flex space-x-2 bg-white/80 backdrop-blur-md border rounded-lg w-fit p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
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
        {activeTab === 'one' ? <AllFormsStrategies /> : <ExtractionContext />}
      </div>
    </div>
  );
}

export default FormStrategies;
