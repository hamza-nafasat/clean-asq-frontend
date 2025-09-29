import AllFormsStrategies from '@/components/admin/AllFormsStrategies';
import React, { useState } from 'react';
import ExtractionContext from '../extractionContext/ExtractionContext';

function FormStrategies() {
  const [activeTab, setActiveTab] = useState('one');

  return (
    <div>
      {/* Tabs aligned top-left */}
      <div className="flex space-x-2 border-b w-fit">
        <button
          onClick={() => setActiveTab('one')}
          className={`px-3 py-1 text-sm rounded-t-md ${activeTab === 'one'
              ? 'bg-primary border-primary border-b-2 font-semibold text-white'
              : 'text-gray-500'
            }`}
        >
          Strategies key
        </button>
        <button
          onClick={() => setActiveTab('two')}
          className={`px-3 py-1 text-sm rounded-t-md ${activeTab === 'two'
              ? 'bg-primary border-primary border-b-2 font-semibold text-white'
              : 'text-gray-500'
            }`}
        >
          Extraction prompt
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'one' ? <AllFormsStrategies /> : <ExtractionContext />}
      </div>
    </div>
  );
}

export default FormStrategies;
