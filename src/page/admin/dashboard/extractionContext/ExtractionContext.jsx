import ExtractionContextCards from '@/components/admin/extractionContext/ExtractionContextCards';
import Button from '@/components/shared/small/Button';
import React, { useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import { FaRegEye } from 'react-icons/fa';
import {
  ClosingInstruction,
  CompleteExtractionPrompt,
  ExtractionGuidelines,
  ExtractionTask,
  OutputFormat,
  SearchResultsHeader,
  SystemContext,
} from '@/data/data';
// const data = [

function ExtractionContext() {
  const [activeTab, setActiveTab] = useState('edit'); // default: edit section

  return (
    <div className="px-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-textPrimary text-3xl font-bold">Manage Extraction Context</div>
          <div className="text-textPrimary text-base">
            Configure the Perplexity AI prompt sections for intelligent data extraction
          </div>
          <div className="text-textPrimary text-base">Last updated: 8/11/2025, 8:06:04 AM</div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Button icon={FiEdit} label={'Edit Sections'} onClick={() => setActiveTab('edit')} />
          </div>
          <div>
            <Button icon={FaRegEye} label={'Preview Full Prompt'} onClick={() => setActiveTab('preview')} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === 'edit' && (
        <div className="mt-8 flex flex-col gap-8">
          <ExtractionContextCards
            title={SystemContext.title}
            section={SystemContext.section}
            subtitle={SystemContext.subtitle}
            prompt={SystemContext.textarea}
          />
          <ExtractionContextCards
            title={ExtractionTask.title}
            section={ExtractionTask.section}
            subtitle={ExtractionTask.subtitle}
            prompt={ExtractionTask.textarea}
          />
          <ExtractionContextCards
            title={OutputFormat.title}
            section={OutputFormat.section}
            subtitle={OutputFormat.subtitle}
            prompt={OutputFormat.textarea}
          />
          <ExtractionContextCards
            title={ExtractionGuidelines.title}
            section={ExtractionGuidelines.section}
            subtitle={ExtractionGuidelines.subtitle}
            prompt={ExtractionGuidelines.textarea}
          />
          <ExtractionContextCards
            title={SearchResultsHeader.title}
            section={SearchResultsHeader.section}
            subtitle={SearchResultsHeader.subtitle}
            prompt={SearchResultsHeader.textarea}
          />
          <ExtractionContextCards
            title={ClosingInstruction.title}
            section={ClosingInstruction.section}
            subtitle={ClosingInstruction.subtitle}
            prompt={ClosingInstruction.textarea}
          />
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="mt-8 flex flex-col gap-8">
          <ExtractionContextCards
            title={CompleteExtractionPrompt.title}
            section={CompleteExtractionPrompt.section}
            subtitle={CompleteExtractionPrompt.subtitle}
            prompt={CompleteExtractionPrompt.textarea}
          />
        </div>
      )}
    </div>
  );
}

export default ExtractionContext;
