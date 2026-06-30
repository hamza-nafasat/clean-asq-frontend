import React from "react";
import TextField from "../shared/small/TextField";
import { PiPhoneCallLight } from "react-icons/pi";

function ApplicationInfo() {
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-xl font-medium">Average Transaction</h1>
      <h5 className="text-textPrimary text-base">Provide average transaction</h5>
      <div className="flex flex-col gap-4">
        <TextField label={"Full Name"} />
        <TextField label={"Title"} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label={"Phone Number"} cnLeft={"font-bold text-textPrimary"} leftIcon={<PiPhoneCallLight />} />
          <TextField label={"Extension"} />
        </div>
        <TextField label={"Email Address"} />
        <TextField label={"Please provide your social security number"} />
      </div>
    </div>
  );
}

export default ApplicationInfo;
