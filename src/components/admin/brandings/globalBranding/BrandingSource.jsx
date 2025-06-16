import React, { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { PiImageLight } from 'react-icons/pi';

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
        <p className="text-[14px] font-semibold text-gray-500 md:text-xl">Choose Your Branding Source</p>
        <div className="font-inter flex items-center gap-2 rounded-[4px] bg-[#F5F5F5] px-[10px] py-[6px] text-[14px] font-normal text-gray-500">
          <HiOutlineSparkles />
          AI Help
        </div>
      </div>
      <div className="mt-6 flex items-end space-x-4">
        <div className="flex-grow">
          <label htmlFor="website-url" className="font-inter block text-[14px] font-normal text-gray-500">
            Enter Website URL
          </label>
          <input
            type="url"
            id="website-url"
            value={websiteUrl}
            onChange={handleUrlChange}
            className="mt-2 block w-full rounded-[4px] border border-[#F6F8FF] bg-[#F6F8FF] px-4 py-2"
            placeholder="https://example.com"
          />
          {/* <p className="mt-2 text-sm text-gray-500">Enter a website URL, to extract its colors and logos for your branding.</p> */}
        </div>
        <button onClick={handleExtract} className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">
          Extract
        </button>
      </div>
      <div className="mt-3 mb-4 flex items-center justify-between gap-5">
        <p className="mt-2 text-sm text-gray-500">
          Enter a website URL, to extract its colors and logos for your branding.
        </p>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button
            onClick={triggerFileInput}
            className="flex items-center space-x-2 rounded-[4px] border bg-white px-2 py-2 text-gray-700 hover:bg-gray-200 md:px-4 md:py-2"
          >
            <FiUpload />
            <span>{selectedFile ? selectedFile.name : 'Upload'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path>
            </svg>
          </button>
        </div>
      </div>
      {/* Placeholder for Available Logos and Upload Logo */}
      <div className="mt-14 flex items-center justify-between space-x-2">
        <div className="flex items-center gap-1.5 text-gray-600 md:gap-3">
          <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M2.45045 0.500009C1.10512 0.500009 0 1.57868 0 2.8918V14.1082C0 15.4213 1.10512 16.5 2.45045 16.5H19.5505C20.8958 16.5 21.9997 15.4213 21.9997 14.1082V12.9758C22.0001 12.9627 22.0001 12.9495 21.9997 12.9363V2.8918C21.9997 1.57867 20.8958 0.5 19.5505 0.5L2.45045 0.500009ZM2.45045 1.76313H19.5505C20.2013 1.76313 20.7056 2.25661 20.7056 2.8918V11.6165L15.8767 7.79135C15.7577 7.69759 15.6085 7.64801 15.4556 7.65142C15.3026 7.65483 15.1559 7.711 15.0414 7.80997L12.2927 10.2016L7.90487 5.79551C7.78637 5.67685 7.62483 5.60839 7.45508 5.60491C7.28534 5.60143 7.121 5.66319 6.99749 5.77689L1.2941 11.0699V2.89169C1.2941 2.25649 1.79967 1.76313 2.45045 1.76313ZM12.0222 3.48883C11.0307 3.51377 10.2214 4.31893 10.2214 5.29223C10.2214 6.28099 11.0573 7.09688 12.0703 7.09688C13.0833 7.09688 13.9191 6.28099 13.9191 5.29223C13.9191 4.30348 13.0833 3.48883 12.0703 3.48883C12.0544 3.48883 12.038 3.48843 12.0222 3.48883ZM12.0412 4.75195C12.0508 4.7515 12.0605 4.75195 12.0702 4.75195C12.3839 4.75195 12.6238 4.98612 12.6238 5.29223C12.6238 5.59834 12.3839 5.83375 12.0702 5.83375C11.7566 5.83375 11.5155 5.59834 11.5155 5.29223C11.5155 4.99569 11.742 4.76601 12.0412 4.75195ZM7.42212 7.12524L12.62 12.3418C12.6795 12.4012 12.7505 12.4485 12.8288 12.4811C12.9071 12.5137 12.9912 12.5309 13.0763 12.5317C13.1614 12.5325 13.2458 12.5169 13.3248 12.4858C13.4037 12.4546 13.4755 12.4087 13.5362 12.3504C13.6577 12.2334 13.727 12.0743 13.7289 11.9077C13.7308 11.7412 13.6652 11.5806 13.5464 11.461L13.1937 11.107L15.49 9.11121L20.7056 13.2435V14.1082C20.7056 14.7434 20.2013 15.2369 19.5505 15.2369H2.45045C1.79967 15.2369 1.2941 14.7434 1.2941 14.1082V12.8142L7.42212 7.12524Z"
              fill="#15A090"
            />
          </svg>
          Available Logos
        </div>
        <button className="flex items-center space-x-1 rounded-[4px] border bg-white px-1.5 py-2 text-gray-700 hover:bg-gray-200 md:space-x-2 md:px-4 md:py-2">
          <FiUpload />
          <span>Upload Logo</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path>
          </svg>
        </button>{' '}
      </div>
    </div>
  );
};

export default BrandingSource;
