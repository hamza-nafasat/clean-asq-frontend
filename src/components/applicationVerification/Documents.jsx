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
    <div className="mt-14 w-full rounded-lg border p-6 shadow-md">
      <h1 className="text-textSecondary text-base">Articles of Incorporation</h1>
      <div className="mt-6 w-full">
        <h5 className="text-textSecondary text-base">
          Please upload a copy of your articles of incorporation (PDF or image file)
        </h5>
        {/* <div className="mt-2 flex h-[283px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed">
          <PiFileArrowUpFill className="text-textLight text-8xl" />
          <h4 className="text-textSecondary text-base font-medium">Click to upload or drag and drop a file</h4>
          <h5 className="text-textLight">.pdf, .doc, .docx, .jpg, .png up to 10MB</h5>
          <Button label={'Select file'} rightIcon={CgSoftwareUpload} />
        </div> */}
        <div className="w-full p-6">
          <FileUploader onFileSelect={handleFileSelect} />
        </div>
      </div>
    </div>
  );
}

export default Documents;
