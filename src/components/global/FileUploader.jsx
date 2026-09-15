import { useEffect, useRef, useState } from "react";
import { CgSoftwareUpload } from "react-icons/cg";
import { PiFileArrowUpFill } from "react-icons/pi";

import Button from "@/components/shared/Button";
import { getFileNameFromUrl } from "@/utils/fieldFile";

const IMAGE_URL_PATTERN = /\.(jpg|jpeg|png|gif|webp)$/i;
const CLOUDINARY_IMAGE_PATH = "/image/";
const CSV_EXTENSION = ".csv";

const FileUploader = ({ label = "", accept = ".pdf,image/*,.csv", onFileSelect = () => {}, existingUrl = "" }) => {
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!existingUrl || fileName) return;
    setFileName(getFileNameFromUrl(existingUrl));
    if (IMAGE_URL_PATTERN.test(existingUrl) || existingUrl.includes(CLOUDINARY_IMAGE_PATH)) setPreviewUrl(existingUrl);
  }, [existingUrl, fileName]);

  const handleFile = (file) => {
    const fileType = file.type;
    const isCSV = file.name.toLowerCase().endsWith(CSV_EXTENSION);
    if (!fileType.includes("image") && !fileType.includes("pdf") && !isCSV) {
      alert("Only PDF, image, or CSV files are allowed.");
      return;
    }
    setFileName(file.name);
    onFileSelect?.(file);
    if (fileType.includes("image")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm text-[#666666] lg:text-base">{label}</label>

      <div
        className="relative mt-2 flex h-70.75 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-gray-500 transition hover:border-[#5570F1] hover:bg-blue-50"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current.click()}
      >
        <PiFileArrowUpFill className="text-textPrimary text-8xl" />
        <h4 className="text-textPrimary text-base font-medium">Click to upload or drag and drop a file</h4>
        <h5 className="text-textPrimary">.pdf, .doc, .docx, .jpg, .png, .csv up to 10MB</h5>
        <Button
          label="Select file"
          className="text-textPrimary! border-gray-300! bg-white! hover:bg-gray-500!"
          rightIcon={CgSoftwareUpload}
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
      </div>

      {fileName && (
        <div className="mt-2 text-sm text-gray-700">
          {existingUrl && !previewUrl ? (
            <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Selected: {fileName}
            </a>
          ) : (
            <>Selected: {fileName}</>
          )}
        </div>
      )}

      {previewUrl && <img src={previewUrl} alt="Preview" className="mt-3 max-h-40 rounded border" />}
    </div>
  );
};

export default FileUploader;
