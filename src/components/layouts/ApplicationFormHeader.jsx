import { FaSave } from "react-icons/fa";
import GridFill from "@/assets/svgs/userApplicationForm/GridFill";
import minLogo from "@/assets/images/minLogo.png";
import Button from "@/components/shared/Button";
const UserApplicationFormHeader = () => {
  return (
    <div className="mx- mt-3 flex h-18.5 items-center justify-between rounded-lg bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <img src={minLogo} alt="logo" className="size-10" />

        <span className="text-textPrimary hidden text-2xl font-bold md:inline">Beneficial Owner Testing</span>
      </div>
      <div className="flex items-center space-x-6">
        <Button label={"Save Progress"} icon={FaSave} />
        <button type="button" aria-label="Open grid" className="text-teal-700 hover:text-teal-600">
          <GridFill size={24} />
        </button>
      </div>
    </div>
  );
};

export default UserApplicationFormHeader;
