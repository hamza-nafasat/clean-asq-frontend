import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import { useEffect, useRef, useState } from 'react';
import { BsGlobe2 } from 'react-icons/bs';
import { FiUpload, FiX } from 'react-icons/fi';
import { GrImage } from 'react-icons/gr';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { IoColorPaletteOutline } from 'react-icons/io5';

const BrandingSource = ({ websiteUrl, setWebsiteUrl, logos, setLogos, extractBranding, isFetchLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [websiteImage, setWebsiteImage] = useState(null);
  const [showPasteMenu, setShowPasteMenu] = useState(false);
  const [pasteTarget, setPasteTarget] = useState(null);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState(null);
  const fileInputRef = useRef(null);
  const pasteMenuRef = useRef(null);
  const logoFileInputRef = useRef(null);

  useEffect(() => {
    const handlePaste = e => {
      if (!pasteTarget) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const url = URL.createObjectURL(blob);
          if (pasteTarget === 'websiteImage') {
            setWebsiteImage(url);
          } else if (pasteTarget === 'logo') {
            setLogos(prev => [...prev, url]);
          }
          setPasteTarget(null);
          setShowPasteMenu(false);
          break;
        }
      }
    };
    if (pasteTarget) {
      window.addEventListener('paste', handlePaste);
    }
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [pasteTarget, setLogos]);

  const handleUrlChange = e => {
    setWebsiteUrl(e.target.value);
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setWebsiteImage(url);
      console.log('File selected:', file.name);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePasteMenu = () => {
    setShowPasteMenu(prev => !prev);
  };

  const handlePasteOption = target => {
    setPasteTarget(target);
    setShowPasteMenu(false);
    setTimeout(() => {
      alert('Now press Ctrl+V to paste your image.');
    }, 100);
  };

  const handleLogoSelect = idx => {
    setSelectedLogoIndex(idx);
  };

  const handleLogoFileUpload = e => {
    const files = Array.from(e.target.files);
    const newLogos = files.filter(file => file.type.startsWith('image/')).map(file => URL.createObjectURL(file));
    setLogos(prev => [...prev, ...newLogos]);
  };

  const handleRemoveLogo = idx => {
    setLogos(prev => prev.filter((_, i) => i !== idx));
    if (selectedLogoIndex === idx) setSelectedLogoIndex(null);
    else if (selectedLogoIndex > idx) setSelectedLogoIndex(selectedLogoIndex - 1);
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
        <Button
          disabled={isFetchLoading}
          className={`${isFetchLoading && 'cursor-not-allowed opacity-50'}`}
          onClick={extractBranding}
          label={'Extract'}
          icon={IoColorPaletteOutline}
        />
      </div>
      <div className="mt-3 mb-4 flex items-center justify-between gap-5">
        <p className="mt-2 text-sm text-gray-500">
          Enter a website URL, to extract its colors and logos for your branding.
        </p>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <div className="relative flex gap-4">
            <Button onClick={triggerFileInput} icon={FiUpload} label={'Upload Website Image'} />
            <div className="relative">
              <Button onClick={handlePasteMenu} icon={FiUpload} label={'Paste as'} />
              {showPasteMenu && (
                <div ref={pasteMenuRef} className="absolute right-0 z-10 mt-2 w-40 rounded border bg-white shadow-lg">
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handlePasteOption('websiteImage')}
                  >
                    Paste as Image
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handlePasteOption('logo')}
                  >
                    Paste as Logo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-primary my-6 border-t-2"></div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div>
            <BsGlobe2 className="text-primary size-6" />
          </div>
          <div className="text-textPrimary">Website / Image Preview</div>
        </div>
        {/* website image section */}
        <div
          className={`mt-4 flex ${websiteImage ? 'h-[300px]' : ''} w-full items-center justify-center rounded-md border p-4`}
        >
          {websiteImage ? (
            <img src={websiteImage} alt="Website Preview" className="mt-2 h-full rounded border object-contain p-2" />
          ) : (
            <span className="text-gray-400">No website image uploaded or pasted.</span>
          )}
        </div>
      </div>
      <div className="border-primary my-6 border-t-2"></div>
      {/* Placeholder for Available Logos and Upload Logo */}
      <div className="flex flex-col items-center justify-between space-x-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-between gap-4 space-x-2">
            <GrImage className="text-primary size-5" />
            Available Logos
          </div>
          <Button
            label={'Upload Logo'}
            icon={FiUpload}
            onClick={() => logoFileInputRef.current && logoFileInputRef.current.click()}
          />
        </div>
        <div className="mt-8 w-full items-center justify-center overflow-auto">
          <input
            type="file"
            ref={logoFileInputRef}
            onChange={handleLogoFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          {/* logo section here is all logo logos are multipal and select able mean logs is select able  */}
          <div className="flex w-full flex-wrap items-center gap-2 overflow-auto p-2">
            {logos?.length > 0 ? (
              logos?.map((logo, idx) => {
                console.log('Logo URL:', logo?.url);
                return (
                  <div
                    key={idx}
                    onClick={() => handleLogoSelect(idx)}
                    className={`relative flex h-[130px] w-[200px] cursor-pointer items-center justify-center gap-2 rounded-md border ${selectedLogoIndex === idx ? 'ring-primary ring-2' : ''}`}
                  >
                    {/* Close icon */}
                    <button
                      type="button"
                      className="bg-primary hover:bg-secondary absolute -top-2 -right-2 z-10 rounded-full p-1 text-gray-500 hover:text-red-500"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveLogo(idx);
                      }}
                    >
                      <FiX size={18} />
                    </button>
                    <div className="flex h-[100px] w-[80%] cursor-pointer flex-col items-center justify-center">
                      <img
                        src={typeof logo === 'string' ? logo : logo?.url}
                        alt={`Logo ${idx + 1}`}
                        className={`h-[calc(100%-30px)] w-[96px] cursor-pointer object-contain`}
                        // onClick={() => handleLogoSelect(idx)}
                      />
                      <div>logo</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <span className="text-gray-400">No logos uploaded or pasted.</span>
            )}
          </div>
        </div>
      </div>
      <div className="border-primary my-6 border-t-2"></div>
    </div>
  );
};

export default BrandingSource;
