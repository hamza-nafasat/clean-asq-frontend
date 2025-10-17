import React, { useState } from 'react';
import Submission from './Submission';
import Draft from './Draft';

function AllSubmissionDraft() {
  const [activeTab, setActiveTab] = useState('one');

  const tabs = [
    { id: 'one', label: 'Submission' },
    { id: 'two', label: 'Draft' },
  ];
  return (
    <div className="w-full">
      <div className="flex w-fit space-x-2 rounded-lg border bg-white/80 p-1.5 shadow-sm backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-primary scale-105 text-white'
                : 'hover:text-primary text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-white"></span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-5">{activeTab === 'one' ? <Submission /> : <Draft />}</div>
    </div>
  );
}

export default AllSubmissionDraft;
