import AllFormsStrategies from '@/components/admin/AllFormsStrategies';
import React, { useState } from 'react';
import ExtractionContext from '../extractionContext/ExtractionContext';

function FormStrategies() {
  const [activeTab, setActiveTab] = useState('one');
  return (
    <div>
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('one')}
          className={`flex-1 p-2 text-center ${
            activeTab === 'one' ? 'bg-primary border-primary border-b-2 font-semibold text-white' : 'text-gray-500'
          }`}
        >
          Strategies key
        </button>
        <button
          onClick={() => setActiveTab('two')}
          className={`flex-1 p-2 text-center ${
            activeTab === 'two' ? 'bg-primary border-primary border-b-2 font-semibold text-white' : 'text-gray-500'
          }`}
        >
          Extraction prompt
        </button>
      </div>
      <div className="mt-4">{activeTab === 'one' ? <AllFormsStrategies /> : <ExtractionContext />}</div>
    </div>
  );
}

export default FormStrategies;
