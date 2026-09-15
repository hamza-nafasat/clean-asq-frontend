import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useFindNaicAndMccMutation } from "@/redux/apis/form.apis";
import ApplicationPdfField from "@/components/global/ApplicationPdfField";
import ApplicationPdfNaicsField from "@/components/global/ApplicationPdfNaicsField";
import ApplicationPdfNaicsModal from "@/components/global/ApplicationPdfNaicsModal";
import SignatureBox from "@/components/global/SignatureBox";
import FieldLabel from "@/components/shared/FieldLabel";
import TextField from "@/components/shared/TextField";
import { FIELD_NAME_MATCHERS, FIELD_NAMES, FIELD_TYPES, SIGNATURE_KEY, STATE_SUGGESTIONS } from "@/constants";
import { openLinksInNewTab } from "@/utils/linkTargets";
import { buildNaicsFromMatch, buildNaicsSelection, filterNaicsSuggestions } from "@/utils/naicsLookup";
import { uploadSectionSignature } from "@/utils/sectionSignature";

const TYPED_FIELD_TYPES = [
  FIELD_TYPES.SELECT,
  FIELD_TYPES.MULTI_CHECKBOX,
  FIELD_TYPES.RADIO,
  FIELD_TYPES.RANGE,
  FIELD_TYPES.CHECKBOX,
  FIELD_TYPES.FILE,
];

const CompanyInformationPdf = ({
  name,
  reduxData,
  fields,
  step,
  isSignature,
  formInnerData,
  sectionKey,
  setFormInnerData,
}) => {
  const prevRef = useRef(null);
  const naicsInputRef = useRef(null);
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
  const [naicsLoading, setNaicsLoading] = useState(false);
  const [findNaicsToMccDetails] = useFindNaicAndMccMutation();

  const handleFindNaics = async () => {
    const description = Object.values(formInnerData?.[sectionKey] || {}).find(
      (v) => v?.name === FIELD_NAMES.COMPANY_DESCRIPTION,
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
      console.error("Find NAICS error:", error);
      toast.error(error?.data?.message || "Failed to find NAICS code");
    } finally {
      setNaicsLoading(false);
    }
  };

  const handleNaicsInputChange = (e) => {
    const value = e.target.value;
    setNaicsToMccDetails((prev) => ({ ...prev, NAICS: value, NAICS_Description: "", MCC: "", MCC_Description: "" }));

    if (value.length > 0) {
      const filtered = filterNaicsSuggestions(value);
      setNaicsSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSaveBestMatch = (bestMatch) => {
    if (!bestMatch?.naics) return toast.error("Please select a best match");
    setNaicsToMccDetails(buildNaicsFromMatch(bestMatch));
    setShowNaicsToMccDetails(false);
  };

  // sync naics into the section data
  useEffect(() => {
    setFormInnerData((prev) => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], naics: naicsToMccDetails } }));
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

  // find naics from the lookup description once it changes
  useEffect(() => {
    const prev = prevRef.current;
    const curr = formData?.company_lookup_data;
    if (JSON.stringify(prev) === JSON.stringify(curr)) return;
    prevRef.current = curr;
    if (!curr) return;
    (async () => {
      const description = curr.find((i) => i?.name === FIELD_NAMES.COMPANY_DESCRIPTION)?.result;
      if (naicsToMccDetails?.NAICS) return;
      if (!description) return;
      try {
        setNaicsLoading(true);
        const res = await findNaicsToMccDetails({ description }).unwrap();
        if (res.success) setNaicsToMccDetails(buildNaicsFromMatch(res.data.bestMatch));
      } catch (error) {
        console.error("Find NAICS from lookup error:", error);
        toast.error(error?.data?.message || "Failed to find NAICS code");
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mt-14 h-full overflow-auto">
      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{name}</p>
      </div>

      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex items-end gap-3">
          <div dangerouslySetInnerHTML={{ __html: openLinksInNewTab(step?.ai_formatting || step?.displayText) }} />
        </div>
      )}

      {fields?.length > 0 &&
        fields.map((field, index) => {
          const isIncorporationField =
            !TYPED_FIELD_TYPES.includes(field.type) &&
            field.name?.toLowerCase().includes(FIELD_NAME_MATCHERS.INCORPORATION);
          if (!isIncorporationField) {
            return (
              <ApplicationPdfField
                key={index}
                field={field}
                form={formInnerData?.[sectionKey]}
                setForm={setFormInnerData}
                sectionKey={sectionKey}
                wrapperClassName={field.type === FIELD_TYPES.RADIO ? "mt-4 flex flex-col gap-2" : "mt-4"}
              />
            );
          }
          return (
            <div key={index} className="mt-4">
              {field.label && <FieldLabel label={field.label} required={field.required} />}
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
        })}
      <ApplicationPdfNaicsModal
        isOpen={Boolean(naicsApiData?.bestMatch?.naics && showNaicsToMccDetails)}
        onClose={() => setShowNaicsToMccDetails(false)}
        onSubmit={handleSaveBestMatch}
        naicsApiData={naicsApiData}
        onMatchesChange={setNaicsApiData}
      />
      <div className="mt-6 flex w-full flex-col items-start">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">NAICS Code and Description</h4>
        <div className="mt-2 flex w-full flex-col gap-4">
          <ApplicationPdfNaicsField
            containerRef={naicsInputRef}
            value={naicsToMccDetails.NAICS}
            isDisabled={isDisabledAllFields}
            isLoading={naicsLoading}
            suggestions={naicsSuggestions}
            showSuggestions={showSuggestions}
            onChange={handleNaicsInputChange}
            onFocus={() => setShowSuggestions(Boolean(naicsToMccDetails.NAICS))}
            onFind={handleFindNaics}
            onSelect={(item) => {
              setNaicsToMccDetails(buildNaicsSelection(item));
              setShowSuggestions(false);
            }}
          />
          <div className="">
            {isSignature && (
              <SignatureBox
                isPdf={true}
                onSave={(file, setIsSaving) =>
                  uploadSectionSignature({ file, setIsSaving, sectionKey, formInnerData, setFormInnerData })
                }
                step={step}
                oldSignatureUrl={formInnerData?.[sectionKey]?.[SIGNATURE_KEY]?.value?.secureUrl || ""}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInformationPdf;
