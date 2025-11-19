import { FIELD_TYPES } from '@/data/constants';
import { useFindNaicAndMccMutation, useGetAllSearchStrategiesQuery } from '@/redux/apis/formApis';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { naicsToMcc } from '../../assets/NAICStoMCC.js';
import SignatureBox from '../shared/SignatureBox.jsx';
import Button from '../shared/small/Button.jsx';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '../shared/small/DynamicField.jsx';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal.jsx';
import Modal from '../shared/small/Modal.jsx';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal.jsx';

function CompanyInformation({
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
  title,
  saveInProgress,
  step,
  isSignature,
}) {
  const prevRef = useRef(null);
  const { user } = useSelector(state => state.auth);
  const { formData } = useSelector(state => state?.form);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
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
  const [naicsLoading, setNaicsLoading] = useState(false);
  const [findNaicsToMccDetails] = useFindNaicAndMccMutation();
  const [strategyKeys, setStrategyKeys] = useState([]);
  const { data: strategyKeysData } = useGetAllSearchStrategiesQuery();
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const requiredNames = useMemo(() => fields.filter(f => f.required).map(f => f.name), [fields]);

  const isCreator = user?._id && user?._id === step?.owner && user?.role !== 'guest';

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

  const findNaicsHandler = async () => {
    const description = form?.['companydescription'];
    if (!description) return toast.error('Please enter a description first');
    try {
      setNaicsLoading(true);
      const res = await findNaicsToMccDetails({ description }).unwrap();
      if (res.success) {
        setNaicsApiData(res?.data);
        setShowNaicsToMccDetails(true);
      }
    } catch (error) {
      console.log('Error finding NAICS:', error);
      toast.error(error?.data?.message || 'Failed to find NAICS code');
    } finally {
      setNaicsLoading(false);
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
        setNaicsLoading(true);
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
      } finally {
        setNaicsLoading(false);
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
          console.log('asdfakjsljd;fkjasldf', fieldValueFromLookupData);
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

  // checking is all required fields are filled or not
  // ---------------------------------------------------
  useEffect(() => {
    if (isCreator) {
      setIsAllRequiredFieldsFilled(true);
      return;
    }
    const allFilled = requiredNames.every(name => {
      const val = form[name];
      if (val == null) return false;
      if (typeof val === 'string') return val.trim() !== '';
      if (Array.isArray(val))
        return (
          val.length > 0 &&
          val.every(item =>
            typeof item === 'object'
              ? Object.values(item).every(v => v?.toString().trim() !== '')
              : item?.toString().trim() !== ''
          )
        );
      return true;
    });
    // check naics filled
    const isNaicsFilled = naicsToMccDetails.NAICS;
    let isCompanyStockSymbol = true;
    if (form?.['company_ownership_type'] == 'public') {
      isCompanyStockSymbol = false;
      if (form?.['stocksymbol']) isCompanyStockSymbol = true;
    }
    // check signature done
    let isSignatureDone = true;
    if (isSignature) {
      let dataOfSign = form?.['signature'];
      if (!dataOfSign?.publicId || !dataOfSign?.secureUrl || !dataOfSign?.resourceType) {
        isSignatureDone = false;
      }
    }

    const isAllRequiredFieldsFilled = allFilled && isNaicsFilled && isCompanyStockSymbol && isSignatureDone;
    setIsAllRequiredFieldsFilled(isAllRequiredFieldsFilled);
  }, [form, isCreator, isSignature, naicsToMccDetails.NAICS, requiredNames]);

  return (
    <div className="mt-14 h-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{name}</p>

        <div className="flex gap-2">
          <Button
            onClick={() => saveInProgress({ data: { ...form, naics: naicsToMccDetails }, name: title })}
            label={'Save my progress'}
          />
          {isCreator && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
            </>
          )}
        </div>
      </div>

      {step?.ai_formatting && (
        <div className="mb-4 flex w-full items-end gap-3">
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting,
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
              <Button
                label={`Find NAICS`}
                className={`text-nowrap ${naicsLoading && 'pointer-events-none opacity-30'}`}
                disabled={naicsLoading}
                onClick={findNaicsHandler}
                icon={naicsLoading && CgSpinner}
                cnLeft={'animate-spin h-5 w-5'}
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
                onSave={signatureUploadHandler}
                step={step}
                oldSignatureUrl={form?.signature?.secureUrl || ''}
              />
            )}
          </div>
        </div>
      </div>
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              className={`${(!isAllRequiredFieldsFilled || loadingNext) && 'pointer-events-none cursor-not-allowed opacity-50'}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              label={isAllRequiredFieldsFilled || loadingNext ? 'Next' : 'Some Required Fields are Missing'}
              onClick={() => handleNext({ data: { ...form, naics: naicsToMccDetails }, name: title, setLoadingNext })}
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext}
              className={`${(formLoading || loadingNext) && 'pinter-events-none cursor-not-allowed opacity-50'}`}
              label={'Submit'}
              onClick={() => handleSubmit({ data: { ...form, naics: naicsToMccDetails }, name: title, setLoadingNext })}
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
                placeholder="NAICS Code and Description"
                type="text"
                readOnly
                value={`${match?.naics}, ${match?.naicsDescription}`}
                title={`${match?.naics}, ${match?.naicsDescription}`}
                className="border-frameColor h-[45px] w-full cursor-pointer rounded-lg bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base"
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
