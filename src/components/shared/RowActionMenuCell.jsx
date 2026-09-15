import { MoreVertical } from "lucide-react";
import { ThreeDotEditViewDelete } from "./ThreeDotViewEditDelete";

const RowActionMenuCell = ({
  row,
  buttons = [],
  isOpen = false,
  onToggle,
  rowRef = undefined,
  buttonClassName = "rounded p-1 hover:bg-gray-100",
  iconClassName = undefined,
}) => (
  <div className="relative" ref={rowRef}>
    <button type="button" onClick={onToggle} className={buttonClassName} aria-label="Actions">
      <MoreVertical size={18} className={iconClassName} />
    </button>
    {isOpen && <ThreeDotEditViewDelete buttons={buttons} row={row} />}
  </div>
);

export default RowActionMenuCell;
