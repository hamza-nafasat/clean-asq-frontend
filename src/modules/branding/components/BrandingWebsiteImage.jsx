import { BsGlobe2 } from "react-icons/bs";
import { FiX } from "react-icons/fi";

const BrandingWebsiteImage = ({ websiteImage = null, onRemove }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-4">
      <BsGlobe2 className="text-primary size-6 shrink-0" />
      <h3 className="text-textPrimary">Website / Image Preview</h3>
    </div>
    <div
      className={`relative mt-4 w-full rounded-md border p-4 ${websiteImage ? "max-h-125 overflow-y-auto" : "flex items-center justify-center"}`}
    >
      {websiteImage ? (
        <>
          <img src={websiteImage} alt="Website Preview" className="mt-2 w-3/4 rounded border object-contain p-2" />
          <button
            type="button"
            aria-label="Remove screenshot"
            onClick={onRemove}
            className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-white p-1 text-gray-500 shadow transition-transform duration-200 hover:scale-110 hover:text-red-500"
          >
            <FiX size={18} />
          </button>
        </>
      ) : (
        <span className="text-gray-400">No website image uploaded or pasted.</span>
      )}
    </div>
  </div>
);

export default BrandingWebsiteImage;
