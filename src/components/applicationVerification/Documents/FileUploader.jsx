import React, { useState, useRef } from 'react';
import { PiFileArrowUpFill } from 'react-icons/pi';
import { CgSoftwareUpload } from 'react-icons/cg';
import Button from '@/components/shared/small/Button';

const FileUploader = ({ label = '', accept = '.pdf,image/*,.csv', onFileSelect = () => { } }) => {
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const isCSV = file => file.name.toLowerCase().endsWith('.csv');
  const handleFile = file => {
    const fileType = file.type;
    if (!fileType.includes('image') && !fileType.includes('pdf') && !isCSV(file)) {
      alert('Only PDF, image, or CSV files are allowed.');
      return;
    }
    setFileName(file.name);
    onFileSelect(file);
    if (fileType.includes('image')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null); // No preview for PDF or CSV
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = e => e.preventDefault();

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm text-[#666666] lg:text-base">{label}</label>

      <div
        className="relative mt-2 flex h-[283px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-gray-500 transition hover:border-[#5570F1] hover:bg-blue-50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current.click()}
      >
        <PiFileArrowUpFill className="text-textPrimary text-8xl" />
        <h4 className="text-textPrimary text-base font-medium">Click to upload or drag and drop a file</h4>
        <h5 className="text-textPrimary">.pdf, .doc, .docx, .jpg, .png, .csv up to 10MB</h5>
        <Button
          label={'Select file'}
          className="text-textPrimary! border-gray-300! bg-white! hover:bg-gray-500!"
          rightIcon={CgSoftwareUpload}
        />
        <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </div>

      {fileName && <div className="mt-2 text-sm text-gray-700">Selected: {fileName}</div>}

      {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />}
    </div>
  );
};

export default FileUploader;
