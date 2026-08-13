import { naicsToMcc } from "../../../../public/NAICStoMCC.js";
import { FIELD_TYPES } from "@/data/constants";
import { STATE_SUGGESTIONS } from "@/constants/constants.js";
import { useFindNaicAndMccMutation } from "@/redux/apis/formApis";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary.js";
import { useEffect, useRef, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SignatureBox from "../../shared/SignatureBox";
import Button from "../../shared/small/Button";
import TextField from "../../shared/small/TextField.jsx";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "./shared/DynamicFieldForPdf";
import Modal from "../../shared/small/Modal.jsx";

function CompanyInformationPdf({
  name,
  reduxData,
  fields,
  step,
  isSignature,
  formInnerData,
  sectionKey,
  setFormInnerData,
}) {
  const prevRef = useRef(null);
  const { formData, isDisabledAllFields } = useSelector((state) => state?.form);
  const [naicsToMccDetails, setNaicsToMccDetails] = useState({
    NAICS: reduxData?.naics?.NAICS || "",
    NAICS_Description: reduxData?.naics?.NAICS_Description || "",
    MCC: reduxData?.naics?.MCC || "",
  });
  const [showNaicsToMccDetails, setShowNaicsToMccDetails] = useState(true);
  const [naicsApiData, setNaicsApiData] = useState({ bestMatch: {}, otherMatches: [] });
  const [naicsSuggestions, setNaicsSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const naicsInputRef = useRef(null);
  const [naicsLoading, setNaicsLoading] = useState(false);
  const [findNaicsToMccDetails] = useFindNaicAndMccMutation();

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");
      if (file) {
        const oldSign = formInnerData?.[sectionKey]?.["signature"]?.value;
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error("File Not Deleted Please Try Again");
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error("File Not Uploaded Please Try Again");
        }
        setFormInnerData((prev) => ({
          ...prev,
          [sectionKey]: { ...prev?.[sectionKey], signature: { name: "signature", value: res } },
        }));
        toast.success("Signature uploaded successfully");
      }
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  const findNaicsHandler = async () => {
    const description = Object.values(formInnerData?.[sectionKey] || {}).find(
      (v) => v?.name === "companydescription",
    )?.value;
    if (!description) return toast.error("Please enter a description first");
    try {
      setNaicsLoading(true);
      const res = await findNaicsToMccDetails({ description }).unwrap();
      if (res.success) {
        setNaicsApiData(res?.data);
        setShowNaicsToMccDetails(true);
      }
    } catch (error) {
      console.log("Error finding NAICS:", error);
      toast.error(error?.data?.message || "Failed to find NAICS code");
    } finally {
      setNaicsLoading(false);
    }
  };

  const handleNaicsInputChange = (e) => {
    const value = e.target.value;
    setNaicsToMccDetails((prev) => ({
      ...prev,
      NAICS: value,
      NAICS_Description: "",
      MCC: "",
      MCC_Description: "",
    }));

    if (value.length > 0) {
      const startsWithNumber = naicsToMcc.filter((item) => item["NAICS Code"].startsWith(value));
      const containsInDescription = naicsToMcc.filter(
        (item) =>
          !item["NAICS Code"].startsWith(value) &&
          item["NAICS Description"].toLowerCase().includes(value.toLowerCase()),
      );
      const allMatches = [...startsWithNumber, ...containsInDescription];
      const filtered = allMatches.slice(0, 20);
      setNaicsSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectNaics = (item) => {
    const formattedValue = `${item["NAICS Code"]}, ${item["NAICS Description"]} ${item["MCC Code"] ? `, ${item["MCC Code"]}` : ""} ${item["MCC Description"] ? `, ${item["MCC Description"]}` : ""}`;
    setNaicsToMccDetails({
      NAICS: formattedValue,
      NAICS_Description: item["NAICS Description"],
      MCC: item["MCC Code"] || "",
      MCC_Description: item["MCC Description"] || "",
    });
    setShowSuggestions(false);
  };

  // Sync naics into formInnerData[sectionKey]
  useEffect(() => {
    setFormInnerData((prev) => ({
      ...prev,
      [sectionKey]: { ...prev?.[sectionKey], naics: naicsToMccDetails },
    }));
  }, [naicsToMccDetails, sectionKey, setFormInnerData]);

  useEffect(() => {
    if (!reduxData?.naics) return;
    setNaicsToMccDetails((prev) => {
      if (prev?.NAICS) return prev;
      return {
        NAICS: reduxData.naics.NAICS || "",
        NAICS_Description: reduxData.naics.NAICS_Description || "",
        MCC: reduxData.naics.MCC || "",
      };
    });
  }, [reduxData?.naics]);

  useEffect(() => {
    const prev = prevRef.current;
    const curr = formData?.company_lookup_data;
    if (JSON.stringify(prev) === JSON.stringify(curr)) return;
    prevRef.current = curr;
    if (!curr) return;
    (async () => {
      const description = curr.find((i) => i?.name === "companydescription")?.result;
      if (naicsToMccDetails?.NAICS) return;
      if (!description) return;
      try {
        setNaicsLoading(true);
        const res = await findNaicsToMccDetails({ description }).unwrap();
        if (res.success) {
          const bestMatch = res.data.bestMatch;
          setNaicsToMccDetails({
            NAICS: `${bestMatch.naics}, ${bestMatch.naicsDescription}`,
            MCC: `${bestMatch.mcc || ""}, ${bestMatch.mccDescription || ""}`,
          });
        }
      } catch (err) {
        toast.error(err?.data?.message || "Failed to find NAICS code");
      } finally {
        setNaicsLoading(false);
      }
    })();
  }, [findNaicsToMccDetails, formData?.company_lookup_data, naicsToMccDetails?.NAICS]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (naicsInputRef.current && !naicsInputRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mt-14 h-full overflow-auto">
      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{name}</p>
      </div>

      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex items-end gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting || step?.displayText).replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}

      {fields?.length > 0 &&
        fields.map((field, index) => {
          if (field.type === FIELD_TYPES.SELECT) {
            return (
              <div key={index} className="mt-4">
                <SelectInputType
                  field={field}
                  sectionKey={sectionKey}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType
                  field={field}
                  sectionKey={sectionKey}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4 flex flex-col gap-2">
                <RadioInputType
                  field={field}
                  sectionKey={sectionKey}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType
                  field={field}
                  sectionKey={sectionKey}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <CheckboxInputType
                  field={field}
                  placeholder={field.placeholder}
                  sectionKey={sectionKey}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.FILE) {
            return (
              <div key={index} className="mt-4">
                <FileInputType
                  field={field}
                  sectionKey={sectionKey}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  className={""}
                />
              </div>
            );
          }
          if (field.name?.toLowerCase().includes("incorp")) {
            return (
              <div key={index} className="mt-4">
                {field.label && (
                  <h4 className="text-textPrimary text-base font-medium lg:text-lg">
                    {field.label}:{field.required ? "*" : ""}
                  </h4>
                )}
                <TextField
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formInnerData?.[sectionKey]?.[field.uniqueId]?.value || ""}
                  disabled={isDisabledAllFields}
                  onChange={(e) =>
                    setFormInnerData((prev) => ({
                      ...prev,
                      [sectionKey]: {
                        ...prev?.[sectionKey],
                        [field.uniqueId]: { name: field.name, value: e.target.value },
                      },
                    }))
                  }
                  required={field.required}
                  suggestions={STATE_SUGGESTIONS}
                  className="mt-2"
                />
              </div>
            );
          }
          return (
            <div key={index} className="mt-4">
              <OtherInputType
                sectionKey={sectionKey}
                field={field}
                placeholder={field.placeholder}
                form={formInnerData?.[sectionKey]}
                setForm={setFormInnerData}
                className={""}
              />
            </div>
          );
        })}
      {naicsApiData?.bestMatch?.naics && showNaicsToMccDetails && (
        <Modal isOpen={showNaicsToMccDetails} onClose={() => setShowNaicsToMccDetails(false)}>
          <NAICSModal
            naicsApiData={naicsApiData}
            setNaicsApiData={setNaicsApiData}
            naicsToMccDetails={naicsToMccDetails}
            setNaicsToMccDetails={setNaicsToMccDetails}
            setShowNaicsToMccDetails={setShowNaicsToMccDetails}
          />
        </Modal>
      )}
      <div className="mt-6 flex w-full flex-col items-start">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">NAICS Code and Description</h4>
        <div className="mt-2 flex w-full flex-col gap-4">
          <div className="relative w-full" ref={naicsInputRef}>
            <div className="flex w-full gap-4">
              <input
                id="naics-code"
                name="naics-code"
                placeholder="Type NAICS code or description..."
                type="text"
                value={naicsToMccDetails.NAICS}
                disabled={isDisabledAllFields}
                className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base ${isDisabledAllFields ? "opacity-70 cursor-not-allowed" : ""}`}
                onChange={handleNaicsInputChange}
                onFocus={() => (naicsToMccDetails.NAICS ? setShowSuggestions(true) : setShowSuggestions(false))}
              />
              {!isDisabledAllFields && (
                <Button
                  label={`Find NAICS`}
                  className={`text-nowrap ${naicsLoading && "pointer-events-none opacity-30"}`}
                  disabled={naicsLoading}
                  onClick={findNaicsHandler}
                  icon={naicsLoading && CgSpinner}
                  cnLeft={"animate-spin h-5 w-5"}
                />
              )}
            </div>
            {showSuggestions && !isDisabledAllFields && (
              <div className="rounded-m absolute z-10 mt-1 max-h-80 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg">
                {naicsSuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleSelectNaics(item)}
                  >
                    <div className="font-medium">{item["NAICS Code"]}</div>
                    <div className="text-sm text-gray-600">{item["NAICS Description"]}</div>
                    {/* <div className="text-sm text-gray-400">{item["MCC Code"]}</div>
                    <div className="text-sm text-gray-400">{item["MCC Description"]}</div> */}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="">
            {isSignature && (
              <SignatureBox
                isPdf={true}
                onSave={signatureUploadHandler}
                step={step}
                oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.value?.secureUrl || ""}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyInformationPdf;

const NAICSModal = ({ naicsApiData, setNaicsApiData, setNaicsToMccDetails, setShowNaicsToMccDetails }) => {
  const handlerOnClickOnOtherMatches = (i) => {
    const bestMatch = { ...naicsApiData?.bestMatch };
    const clickedMatch = { ...naicsApiData?.otherMatches[i] };
    const remainingOtherMatches = naicsApiData?.otherMatches.filter((match, index) => index !== i);
    bestMatch.naics = clickedMatch.naics;
    bestMatch.naicsDescription = clickedMatch.naicsDescription;
    bestMatch.mcc = clickedMatch.mcc;
    bestMatch.mccDescription = clickedMatch.mccDescription;
    remainingOtherMatches.push(naicsApiData?.bestMatch);
    setNaicsApiData({ otherMatches: remainingOtherMatches, bestMatch });
  };
  const saveHandler = (bestMatch) => {
    if (!bestMatch?.naics) return toast.error("Please select a best match");
    setNaicsToMccDetails({
      NAICS: `${bestMatch?.naics}, ${bestMatch?.naicsDescription}`,
      MCC: `${bestMatch?.mcc || ""}, ${bestMatch?.mccDescription || ""}`,
    });
    setShowNaicsToMccDetails(false);
  };
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <section className="flex w-full flex-col">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">Best Match</h4>
        <div className={`'mt-2' flex w-full gap-4`}>
          <input
            placeholder={"NAICS Code and Description"}
            type={"text"}
            readOnly
            value={`${naicsApiData?.bestMatch?.naics ? naicsApiData?.bestMatch?.naics + " ," : ""} ${naicsApiData?.bestMatch?.naicsDescription || ""}`}
            className={`border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base`}
          />
        </div>
      </section>
      <section className="flex w-full flex-col">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">Other Possible Matches</h4>
        <div className={`'mt-2' flex w-full gap-4`}>
          {naicsApiData?.otherMatches?.map((match, i) => (
            <button className="cursor-pointer" key={i} onClick={() => handlerOnClickOnOtherMatches(i)}>
              <input
                placeholder="NAICS Code and Description"
                type="text"
                readOnly
                value={`${match?.naics}, ${match?.naicsDescription}`}
                title={`${match?.naics}, ${match?.naicsDescription}`}
                className={`border-frameColor h-11.25 w-full cursor-pointer rounded-lg bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base`}
              />
            </button>
          ))}
        </div>
      </section>
      <div className="flex w-full items-center justify-end">
        <Button
          label="Save Best Match"
          onClick={() => {
            saveHandler(naicsApiData?.bestMatch);
            setShowNaicsToMccDetails(false);
          }}
        />
      </div>
    </div>
  );
};
