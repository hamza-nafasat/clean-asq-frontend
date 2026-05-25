import { FIELD_TYPES } from "@/data/constants";
import { useFindNaicAndMccMutation, useGetAllSearchStrategiesQuery } from "@/redux/apis/formApis";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { naicsToMcc } from "../../../public/NAICStoMCC.js";
import SignatureBox from "../shared/SignatureBox.jsx";
import Button from "../shared/small/Button.jsx";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "../shared/small/DynamicField.jsx";
import TextField from "../shared/small/TextField.jsx";
import { EditSectionDisplayTextFromatingModal } from "../shared/small/EditSectionDisplayTextFromatingModal.jsx";
import Modal from "../shared/small/Modal.jsx";
import CustomizationFieldsModal from "./companyInfo/CustomizationFieldsModal.jsx";
import { STATE_SUGGESTIONS } from "@/constants/constants.js";

function CompanyInformation({
  sectionKey,
  formRefetch,
  _id,
  name,
  handleNext,
  handlePrevious,
  currentStep,
  totalSteps,
  handleSubmit,
  reduxData,
  formLoading,
  fields,
  saveInProgress,
  step,
  isSignature,
}) {
  const prevRef = useRef(null);
  const containerRef = useRef(null);
  const formContainerRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const { formData } = useSelector((state) => state?.form);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
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
  const [naicsSuggestionsAbove, setNaicsSuggestionsAbove] = useState(false);
  const [findNaicsToMccDetails] = useFindNaicAndMccMutation();
  const [strategyKeys, setStrategyKeys] = useState([]);
  const { data: strategyKeysData } = useGetAllSearchStrategiesQuery();
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const requiredNames = useMemo(
    () => fields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId })),
    [fields],
  );

  const isCreator = user?._id && user?._id === step?.owner && user?.role !== "guest";

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");
      if (file) {
        const oldSign = form?.["signature"]?.value || {};
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error("File Not Deleted Please Try Again");
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error("File Not Uploaded Please Try Again");
        }
        setForm((prev) => ({ ...prev, signature: { name: "signature", value: res } }));
        toast.success("Signature uploaded successfully");
      }
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  const findNaicsHandler = async () => {
    const description = Object.values(form).find((v) => v?.name === "companydescription")?.value;
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

  // Filter NAICS codes based on input
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
      // First, find all NAICS codes that start with the entered number
      const startsWithNumber = naicsToMcc.filter((item) => item["NAICS Code"].startsWith(value));

      // Then find descriptions containing the value (case insensitive)
      const containsInDescription = naicsToMcc.filter(
        (item) =>
          !item["NAICS Code"].startsWith(value) &&
          item["NAICS Description"].toLowerCase().includes(value.toLowerCase()),
      );

      // Combine both, with exact matches first, then description matches
      const allMatches = [...startsWithNumber, ...containsInDescription];

      // Show more results (up to 20) for better discovery
      const filtered = allMatches.slice(0, 20);

      setNaicsSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle selection from suggestions
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

  useEffect(() => {
    if (strategyKeysData?.data) {
      setStrategyKeys(strategyKeysData?.data?.map((item) => item?.searchObjectKey));
    }
  }, [strategyKeysData]);

  useEffect(() => {
    const prev = prevRef.current;
    const curr = formData?.company_lookup_data;
    // Compare actual values, not just reference
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
          console.log("i am called baby");
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (naicsInputRef.current && !naicsInputRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const lookupData = formData?.company_lookup_data;
      const initialForm = {};
      let isDateField = false;
      fields.forEach((field) => {
        let fieldValueFromLookupData = lookupData?.find((item) => {
          const fieldName = field?.name?.trim()?.toLowerCase();
          const itemName = item?.name?.trim()?.toLowerCase();
          if (itemName == fieldName && itemName?.includes("date")) isDateField = true;
          return fieldName === itemName;
        })?.result;
        if (isDateField) {
          let formatedData = fieldValueFromLookupData
            ? new Date(fieldValueFromLookupData)?.toISOString()?.split("T")?.[0]
            : "";
          isDateField = false;
          // initialForm[field.name] = reduxData?.[field?.name] || formatedData || "";
          initialForm[field.uniqueId] = {
            name: field.name,
            value: reduxData?.[field?.uniqueId]?.value || formatedData || "",
          };
        } else {
          // initialForm[field.name] = reduxData?.[field?.name] || fieldValueFromLookupData || "";
          initialForm[field.uniqueId] = {
            name: field.name,
            value: reduxData?.[field?.uniqueId]?.value || fieldValueFromLookupData || "",
          };
        }
      });
      setForm(initialForm);
    }
    // if (isSignature) {
    //   const isSignatureExistingData = {};
    //   if (reduxData?.signature?.publicId) isSignatureExistingData.publicId = reduxData?.signature?.publicId;
    //   if (reduxData?.signature?.secureUrl) isSignatureExistingData.secureUrl = reduxData?.signature?.secureUrl;
    //   if (reduxData?.signature?.resourceType) isSignatureExistingData.resourceType = reduxData?.signature?.resourceType;
    //   setForm((prev) => ({
    //     ...prev,
    //     ["signature"]: isSignatureExistingData?.publicId
    //       ? isSignatureExistingData
    //       : { publicId: "", secureUrl: "", resourceType: "" },
    //   }));
    // }

    if (isSignature) {
      const isSignatureExistingData = {};
      if (reduxData?.signature?.value?.publicId)
        isSignatureExistingData.publicId = reduxData?.signature?.value?.publicId;
      if (reduxData?.signature?.value?.secureUrl)
        isSignatureExistingData.secureUrl = reduxData?.signature?.value?.secureUrl;
      if (reduxData?.signature?.value?.resourceType)
        isSignatureExistingData.resourceType = reduxData?.signature?.value?.resourceType;
      setForm((prev) => ({
        ...prev,
        ["signature"]: {
          name: "signature",
          value: isSignatureExistingData?.publicId
            ? isSignatureExistingData
            : { publicId: "", secureUrl: "", resourceType: "" },
        },
      }));
    }
  }, [fields, formData?.company_lookup_data, isSignature, reduxData]);

  // checking is all required fields are filled or not
  // ---------------------------------------------------
  useEffect(() => {
    if (isCreator) {
      setIsAllRequiredFieldsFilled(true);
      return;
    }
    const allFilled = requiredNames.every((name) => {
      const val = form[name.uniqueId]?.value;
      console.log("name", name, "val", val);
      if (val == null) return false;
      if (typeof val === "string") return val.trim() !== "";
      if (Array.isArray(val))
        return (
          val.length > 0 &&
          val.every((item) =>
            typeof item === "object"
              ? Object.values(item).every((v) => v?.toString().trim() !== "")
              : item?.toString().trim() !== "",
          )
        );
      return true;
    });

    // check naics filled
    const isNaicsFilled = naicsToMccDetails.NAICS ? true : false;
    let isCompanyStockSymbol = true;
    if (form?.["company_ownership_type"]?.value == "public") {
      isCompanyStockSymbol = false;
      if (form?.["stocksymbol"]?.value) isCompanyStockSymbol = true;
    }
    // check signature done
    let isSignatureDone = true;
    if (isSignature) {
      let dataOfSign = form?.["signature"];
      if (!dataOfSign?.publicId || !dataOfSign?.secureUrl || !dataOfSign?.resourceType) {
        isSignatureDone = false;
      }
    }

    console.log(allFilled, isNaicsFilled, isCompanyStockSymbol, isSignatureDone);
    const isAllRequiredFieldsFilled = allFilled && isNaicsFilled && isCompanyStockSymbol && isSignatureDone;
    setIsAllRequiredFieldsFilled(isAllRequiredFieldsFilled);
  }, [form, isCreator, isSignature, naicsToMccDetails.NAICS, requiredNames]);

  // for dangerouslySetInnerHTML redirection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const links = container.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  }, [step?.ai_formatting]);

  // Focus the first visible text input after the initial render cascade settles.
  // autoFocus fires at commit time (before setForm initialisms form state), so the
  // subsequent re-render can knock focus loose. Two rAF frames land safely after
  // all initial effects and their queued re-renders have flushed.
  useEffect(() => {
    let frame1, frame2;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        const container = formContainerRef.current;
        if (!container) return;
        const inputs = Array.from(
          container.querySelectorAll(
            "input:not([disabled]):not([readonly]):not(#naics-code), textarea:not([disabled]):not([readonly])",
          ),
        ).filter((el) => el.offsetParent !== null);
        if (inputs.length > 0) inputs[0].focus();
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, []);

  // Keep a fresh reference to the next/submit action so the Enter handler below
  // never captures stale closure values (form, naicsToMccDetails, etc.).
  submitFromEnterRef.current = () => {
    if (!isAllRequiredFieldsFilled || loadingNext) return;
    if (currentStep < totalSteps - 1) {
      handleNext({ data: { ...form, naics: naicsToMccDetails }, name: sectionKey, setLoadingNext });
    } else {
      handleSubmit({ data: { ...form, naics: naicsToMccDetails }, name: sectionKey, setLoadingNext });
    }
  };

  // Enter key inside any text input: advance to the next input, or trigger
  // Next/Submit from the last one. Excludes the NAICS input (has its own logic).
  // Skips if the event was already handled by a child (e.g. suggestion dropdown).
  useEffect(() => {
    const container = formContainerRef.current;
    if (!container) return;
    const handler = (e) => {
      if (e.key !== "Enter" || e.defaultPrevented) return;
      if (!container.contains(document.activeElement)) return;
      if (document.activeElement?.id === "naics-code") return;
      if (document.activeElement?.tagName?.toLowerCase() !== "input") return;
      const inputs = Array.from(
        container.querySelectorAll("input:not([disabled]):not([readonly]):not(#naics-code)"),
      ).filter((el) => el.offsetParent !== null);
      const idx = inputs.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      if (idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      } else {
        submitFromEnterRef.current?.();
      }
    };
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, []);

  const checkNaicsPosition = () => {
    if (!naicsInputRef.current) return;
    const rect = naicsInputRef.current.getBoundingClientRect();
    setNaicsSuggestionsAbove(window.innerHeight - rect.bottom < 350);
  };

  return (
    <div ref={formContainerRef} className="mt-14 h-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold" data-ai-display-text>
          {name}
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => saveInProgress({ data: { ...form, naics: naicsToMccDetails }, name: sectionKey })}
            label={"Save my progress"}
          />
          {isCreator && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={"Customize"} />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label={"Update Display Text"} />
            </>
          )}
        </div>
      </div>

      {step?.ai_formatting && (
        <div className="mb-4 flex w-full items-end gap-3">
          <div
            className="w-full"
            ref={containerRef}
            data-ai-display-text
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting).replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
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
                <SelectInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4 flex flex-col gap-2">
                <RadioInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.FILE) {
            return (
              <div key={index} className="mt-4">
                <FileInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <CheckboxInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={form}
                  setForm={setForm}
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
                  value={form[field.uniqueId]?.value || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [field.uniqueId]: { name: field.name, value: e.target.value } }))
                  }
                  required={field.required}
                  suggestions={STATE_SUGGESTIONS}
                  className="mt-2"
                />
              </div>
            );
          }
          return (
            <div
              key={index}
              className="mt-4"
              data-ai-loading={
                field.name === "companydescription" && !formData?.company_lookup_data ? "true" : undefined
              }
            >
              <OtherInputType
                field={field}
                placeholder={field.placeholder}
                form={form}
                setForm={setForm}
                className={""}
              />
            </div>
          );
        })}
      {/* NAICS to MCC SECTION  */}
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
                className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base ${!naicsToMccDetails.NAICS ? "bg-highlighting border-accent! border-2" : ""}`}
                data-ai-has-suggestions="true"
                data-ai-required="true"
                data-ai-label="NAICS Code and Description"
                data-ai-loading={naicsLoading ? "true" : undefined}
                onChange={(e) => {
                  checkNaicsPosition();
                  handleNaicsInputChange(e);
                }}
                onFocus={() => {
                  checkNaicsPosition();
                  naicsToMccDetails.NAICS ? setShowSuggestions(true) : setShowSuggestions(false);
                }}
              />
              <Button
                label={`Find NAICS`}
                className={`text-nowrap ${naicsLoading && "pointer-events-none opacity-30"}`}
                disabled={naicsLoading}
                onClick={findNaicsHandler}
                icon={naicsLoading && CgSpinner}
                cnLeft={"animate-spin h-5 w-5"}
              />
            </div>
            {showSuggestions && (
              <div
                className={`rounded-md absolute z-10 max-h-80 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg ${naicsSuggestionsAbove ? "bottom-full mb-1" : "mt-1"}`}
              >
                {naicsSuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleSelectNaics(item)}
                  >
                    <div className="font-medium">{item["NAICS Code"]}</div>
                    <div className="text-sm text-gray-600">{item["NAICS Description"]}</div>
                    <div className="text-sm text-gray-400">{item["MCC Code"]}</div>
                    <div className="text-sm text-gray-400">{item["MCC Description"]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="">
            {isSignature && (
              <SignatureBox
                onSave={signatureUploadHandler}
                step={step}
                oldSignatureUrl={form?.signature?.value?.secureUrl || ""}
              />
            )}
          </div>
        </div>
      </div>
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && (
            <Button variant="secondary" label={"Previous"} onClick={handlePrevious} data-testid="form-back-btn" />
          )}
          {currentStep < totalSteps - 1 ? (
            <Button
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && "pointer-events-none cursor-not-allowed opacity-50"}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled || loadingNext ? "Next" : "Some Required Fields are Missing"}
              data-testid="form-next-btn"
              onClick={() =>
                handleNext({
                  data: { ...form, naics: naicsToMccDetails },
                  name: sectionKey,
                  setLoadingNext,
                })
              }
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext}
              className={`${(formLoading || loadingNext) && "pinter-events-none cursor-not-allowed opacity-50"}`}
              label={"Submit"}
              data-testid="form-submit-btn"
              onClick={() =>
                handleSubmit({
                  data: { ...form, naics: naicsToMccDetails },
                  name: sectionKey,
                  setLoadingNext,
                })
              }
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            suggestions={strategyKeys}
            sectionId={_id}
            fields={fields}
            formRefetch={formRefetch}
            isSignature={isSignature}
            section={step}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default CompanyInformation;

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
            value={`${naicsApiData?.bestMatch?.naics ? naicsApiData?.bestMatch?.naics + " ," : ""} ${naicsApiData?.bestMatch?.naicsDescription || ""} ${naicsApiData?.bestMatch?.mcc ? " , " + naicsApiData?.bestMatch?.mcc : ""} ${naicsApiData?.bestMatch?.mccDescription ? " , " + naicsApiData?.bestMatch?.mccDescription : ""}`}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base`}
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
                value={`${match?.naics}, ${match?.naicsDescription} ${match?.mcc ? `, ${match?.mcc} , ${match?.mccDescription}` : ""}`}
                title={`${match?.naics}, ${match?.naicsDescription} ${match?.mcc ? `, ${match?.mcc} , ${match?.mccDescription}` : ""}`}
                className={`border-frameColor h-[45px] w-full cursor-pointer rounded-lg bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base`}
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
