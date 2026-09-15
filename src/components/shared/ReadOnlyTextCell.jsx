const DEFAULT_CLASS =
  "text-textPrimary border-frameColor w-full resize-none rounded-md border bg-[#FAFBFF] p-2 text-sm";

const ReadOnlyTextCell = ({ value, className = DEFAULT_CLASS }) => (
  <textarea value={value} readOnly className={className} rows={2} />
);

export default ReadOnlyTextCell;
