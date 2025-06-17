import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React, { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { PiImageLight } from 'react-icons/pi';
import { GrImage } from 'react-icons/gr';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { LuUpload } from 'react-icons/lu';

const BrandingSource = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleUrlChange = e => {
    setWebsiteUrl(e.target.value);
  };

  const handleExtract = () => {
    if (!websiteUrl) {
      alert('Please enter a valid website URL');
      return;
    }
    // TODO: Add your extraction logic here
    console.log('Extracting from URL:', websiteUrl);
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setSelectedFile(file);
      // TODO: Add your file processing logic here
      console.log('File selected:', file.name);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between">
        <p className="text-base font-semibold text-gray-500 md:text-xl">Choose Your Branding Source</p>
        <div className="flex items-center gap-2 rounded-[4px] bg-[#F5F5F5] px-[10px] py-[6px] text-base font-normal text-gray-500">
          <HiOutlineSparkles />
          AI Help
        </div>
      </div>
      <div className="mt-6 flex items-end space-x-4">
        <div className="flex-grow">
          <TextField
            type="url"
            id="website-url"
            value={websiteUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            label={'Enter Website URL'}
          />
          {/* <p className="mt-2 text-sm text-gray-500">Enter a website URL, to extract its colors and logos for your branding.</p> */}
        </div>
        <Button onClick={handleExtract} label={'Extract'} />
      </div>
      <div className="mt-3 mb-4 flex items-center justify-between gap-5">
        <p className="mt-2 text-sm text-gray-500">
          Enter a website URL, to extract its colors and logos for your branding.
        </p>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

          <Button onClick={triggerFileInput} icon={FiUpload} label={selectedFile ? selectedFile.name : 'Upload'} />
        </div>
      </div>
      {/* Placeholder for Available Logos and Upload Logo */}
      <div className="mt-14 flex items-center justify-between space-x-2">
        <div className="flex items-center gap-1.5 text-gray-600 md:gap-3">
          <GrImage className="text-primary size-5" />
          Available Logos
        </div>

        <Button label={'Upload Logo'} icon={FiUpload} />
      </div>
    </div>
  );
};

export default BrandingSource;
