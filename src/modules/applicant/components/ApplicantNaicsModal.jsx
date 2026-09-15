import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import { formatNaicsBestMatch, swapNaicsBestMatch } from "../utils/applicant.utils8";

const ApplicantNaicsModal = ({ isOpen = false, naicsApiData = {}, setNaicsApiData, setNaicsToMccDetails, onClose }) => {
  if (!isOpen) return null;

  const bestMatch = naicsApiData?.bestMatch;

  const handleSave = () => {
    if (bestMatch?.naics) setNaicsToMccDetails?.(formatNaicsBestMatch(bestMatch));
    else toast.error("Please select a best match");
    onClose?.();
  };

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <section className="flex w-full flex-col">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">Best Match</h4>
        <div className={`'mt-2' flex w-full gap-4`}>
          <input
            placeholder="NAICS Code and Description"
            type="text"
            readOnly
            value={`${bestMatch?.naics ? bestMatch?.naics + " ," : ""} ${bestMatch?.naicsDescription || ""}`}
            className="border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base"
          />
        </div>
      </section>
      <section className="flex w-full flex-col">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">Other Possible Matches</h4>
        <div className={`'mt-2' flex w-full gap-4`}>
          {naicsApiData?.otherMatches?.map((match, i) => (
            <button
              type="button"
              className="cursor-pointer"
              key={i}
              onClick={() => setNaicsApiData?.(swapNaicsBestMatch(naicsApiData, i))}
            >
              <input
                placeholder="NAICS Code and Description"
                type="text"
                readOnly
                value={`${match?.naics}, ${match?.naicsDescription}`}
                title={`${match?.naics}, ${match?.naicsDescription}`}
                className="border-frameColor h-11.25 w-full cursor-pointer rounded-lg bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base"
              />
            </button>
          ))}
        </div>
      </section>
      <div className="flex w-full items-center justify-end">
        <Button label="Save Best Match" onClick={handleSave} />
      </div>
    </div>
  );
};

export default ApplicantNaicsModal;
