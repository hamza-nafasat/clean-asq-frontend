//

import { naicsToMcc } from '@/assets/NAICStoMCC.js';
import { FIELD_TYPES } from '@/data/constants';
import { useFindNaicAndMccMutation, useGetAllSearchStrategiesQuery } from '@/redux/apis/formApis';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary.js';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SignatureBox from '../../shared/SignatureBox';
import Button from '../../shared/small/Button';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from './shared/DynamicFieldForPdf';
import { EditSectionDisplayTextFromatingModal } from '../../shared/small/EditSectionDisplayTextFromatingModal.jsx';
import Modal from '../../shared/small/Modal.jsx';
// import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal.jsx';
import CustomizationFieldsModal from '../companyInfo/CustomizationFieldsModal';

function CompanyInformationPdf({ formRefetch, _id, name, reduxData, fields, step, isSignature }) {
  const prevRef = useRef(null);
  const { formData } = useSelector(state => state?.form);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});
  const [naicsToMccDetails, setNaicsToMccDetails] = useState({
    NAICS: reduxData?.naics?.NAICS || '',
    NAICS_Description: reduxData?.naics?.NAICS_Description || '',
    MCC: reduxData?.naics?.MCC || '',
  });
  const [showNaicsToMccDetails, setShowNaicsToMccDetails] = useState(true);
  const [naicsApiData, setNaicsApiData] = useState({ bestMatch: {}, otherMatches: [] });
  const [naicsSuggestions, setNaicsSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const naicsInputRef = useRef(null);
  const [findNaicsToMccDetails] = useFindNaicAndMccMutation();
  const [strategyKeys, setStrategyKeys] = useState([]);
  const { data: strategyKeysData } = useGetAllSearchStrategiesQuery();
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error('Please select a file');
      if (file) {
        const oldSign = form?.['signature'];
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error('File Not Deleted Please Try Again');
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error('File Not Uploaded Please Try Again');
        }
        setForm(prev => ({ ...prev, signature: res }));
        toast.success('Signature uploaded successfully');
      }
    } catch (error) {
      console.log('error while uploading signature', error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  // Filter NAICS codes based on input
  const handleNaicsInputChange = e => {
    const value = e.target.value;
    setNaicsToMccDetails(prev => ({
      ...prev,
      NAICS: value,
      NAICS_Description: '', // Clear description when manually typing
      MCC: '',
      MCC_Description: '',
    }));

    if (value.length > 0) {
      // First, find all NAICS codes that start with the entered number
      const startsWithNumber = naicsToMcc.filter(item => item['NAICS Code'].startsWith(value));

      // Then find descriptions containing the value (case insensitive)
      const containsInDescription = naicsToMcc.filter(
        item =>
          !item['NAICS Code'].startsWith(value) && item['NAICS Description'].toLowerCase().includes(value.toLowerCase())
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
  const handleSelectNaics = item => {
    const formattedValue = `${item['NAICS Code']}, ${item['NAICS Description']}`;
    setNaicsToMccDetails({
      NAICS: formattedValue,
      NAICS_Description: item['NAICS Description'],
      MCC: item['MCC Code'] || '',
      MCC_Description: item['MCC Description'] || '',
    });
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (strategyKeysData?.data) {
      setStrategyKeys(strategyKeysData?.data?.map(item => item?.searchObjectKey));
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
      const description = curr.find(i => i?.name === 'companydescription')?.result;
      if (naicsToMccDetails?.NAICS) return;
      if (!description) return;
      try {
        const res = await findNaicsToMccDetails({ description }).unwrap();
        if (res.success) {
          console.log('i am called baby');
          const bestMatch = res.data.bestMatch;
          setNaicsToMccDetails({
            NAICS: `${bestMatch.naics}, ${bestMatch.naicsDescription}`,
            MCC: `${bestMatch.mcc || ''}, ${bestMatch.mccDescription || ''}`,
          });
        }
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to find NAICS code');
      }
    })();
  }, [findNaicsToMccDetails, formData?.company_lookup_data, naicsToMccDetails?.NAICS]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (naicsInputRef.current && !naicsInputRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const lookupData = formData?.company_lookup_data;
      const initialForm = {};
      let isDateField = false;
      fields.forEach(field => {
        let fieldValueFromLookupData = lookupData?.find(item => {
          const fieldName = field?.name?.trim()?.toLowerCase();
          const itemName = item?.name?.trim()?.toLowerCase();
          if (itemName == fieldName && itemName?.includes('date')) isDateField = true;
          return fieldName === itemName;
        })?.result;
        if (isDateField) {
          let formatedData = fieldValueFromLookupData
            ? new Date(fieldValueFromLookupData)?.toISOString()?.split('T')?.[0]
            : '';
          isDateField = false;
          initialForm[field.name] = reduxData?.[field?.name] || formatedData || '';
        } else {
          initialForm[field.name] = reduxData?.[field?.name] || fieldValueFromLookupData || '';
        }
      });
      setForm(initialForm);
    }
    if (isSignature) {
      const isSignatureExistingData = {};
      if (reduxData?.signature?.publicId) isSignatureExistingData.publicId = reduxData?.signature?.publicId;
      if (reduxData?.signature?.secureUrl) isSignatureExistingData.secureUrl = reduxData?.signature?.secureUrl;
      if (reduxData?.signature?.resourceType) isSignatureExistingData.resourceType = reduxData?.signature?.resourceType;
      setForm(prev => ({
        ...prev,
        ['signature']: isSignatureExistingData?.publicId
          ? isSignatureExistingData
          : { publicId: '', secureUrl: '', resourceType: '' },
      }));
    }
  }, [fields, formData?.company_lookup_data, isSignature, reduxData]);

  return (
    <div className="mt-14 h-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{name}</p>
      </div>

      {step?.ai_formatting && (
        <div className="mb-4 flex items-end gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting).replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
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
                <SelectInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4 flex flex-col gap-2">
                <RadioInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType field={field} form={form} setForm={setForm} className={''} />
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
                  className={''}
                />
              </div>
            );
          }
          return (
            <div key={index} className="mt-4">
              <OtherInputType
                field={field}
                placeholder={field.placeholder}
                form={form}
                setForm={setForm}
                className={''}
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
                placeholder="Type NAICS code or description..."
                type="text"
                value={naicsToMccDetails.NAICS}
                className="border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
                onChange={handleNaicsInputChange}
                onFocus={() => (naicsToMccDetails.NAICS ? setShowSuggestions(true) : setShowSuggestions(false))}
              />
            </div>
            {showSuggestions && (
              <div className="rounded-m absolute z-10 mt-1 max-h-80 w-full overflow-y-auto">
                {naicsSuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleSelectNaics(item)}
                  >
                    <div className="font-medium">{item['NAICS Code']}</div>
                    <div className="text-sm text-gray-600">{item['NAICS Description']}</div>
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
                oldSignatureUrl={form?.signature?.secureUrl || ''}
              />
            )}
          </div>
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

export default CompanyInformationPdf;

const NAICSModal = ({ naicsApiData, setNaicsApiData, setNaicsToMccDetails, setShowNaicsToMccDetails }) => {
  const handlerOnClickOnOtherMatches = i => {
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
  const saveHandler = bestMatch => {
    if (!bestMatch?.naics) return toast.error('Please select a best match');
    setNaicsToMccDetails({
      NAICS: `${bestMatch?.naics}, ${bestMatch?.naicsDescription}`,
      MCC: `${bestMatch?.mcc || ''}, ${bestMatch?.mccDescription || ''}`,
    });
    setShowNaicsToMccDetails(false);
  };
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <section className="flex w-full flex-col">
        <h4 className="text-textPrimary text-base font-medium lg:text-lg">Best Match</h4>
        <div className={`'mt-2' flex w-full gap-4`}>
          <input
            placeholder={'NAICS Code and Description'}
            type={'text'}
            readOnly
            value={`${naicsApiData?.bestMatch?.naics ? naicsApiData?.bestMatch?.naics + ' ,' : ''} ${naicsApiData?.bestMatch?.naicsDescription || ''}`}
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
                placeholder={'NAICS Code and Description'}
                type={'text'}
                readOnly
                value={`${match?.naics}, ${match?.naicsDescription}`}
                className={`border-frameColor h-[45px] w-full cursor-pointer! rounded-lg bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base`}
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
