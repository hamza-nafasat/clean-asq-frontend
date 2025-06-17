import React from 'react';
import FileUploader from './Documents/FileUploader';
import { PiFileArrowUpFill } from 'react-icons/pi';
import Button from '../shared/small/Button';
import { CgSoftwareUpload } from 'react-icons/cg';

function Documents({ data, updateField, index }) {
  const handleFileSelect = file => {
    console.log('Selected file:', file);
    // Upload logic or further processing
  };
  return (
    <div className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-base">Articles of Incorporation</h1>
      <div className="mt-6 w-full">
        <h5 className="text-textPrimary text-base">
          Please upload a copy of your articles of incorporation (PDF or image file)
        </h5>

        <div className="w-full p-6">
          <FileUploader onFileSelect={handleFileSelect} />
        </div>
      </div>
    </div>
  );
}

export default Documents;
