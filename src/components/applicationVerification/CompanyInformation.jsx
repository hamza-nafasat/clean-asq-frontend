import { FIELD_TYPES } from '@/data/constants';
import { useFindNaicAndMccMutation, useGetAllSearchStrategiesQuery } from '@/redux/apis/formApis';
import { PencilIcon } from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { naicsToMcc } from '../../assets/NAICStoMCC.js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Button from '../shared/small/Button.jsx';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '../shared/small/DynamicField.jsx';
import Modal from '../shared/small/Modal.jsx';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal.jsx';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal.jsx';
import SignatureBox from '../shared/SignatureBox.jsx';

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
  signUrl,
}) {
  const { user } = useSelector(state => state.auth);
  const { lookupData } = useSelector(state => state?.company);
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
  const [findNaicsToMccDetails, { isLoading }] = useFindNaicAndMccMutation();
  const [strategyKeys, setStrategyKeys] = useState([]);
  const { data: strategyKeysData } = useGetAllSearchStrategiesQuery();
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);

  useEffect(() => {
    if (strategyKeysData?.data) {
      setStrategyKeys(strategyKeysData?.data?.map(item => item?.searchObjectKey));
    }
  }, [strategyKeysData]);

  const requiredNames = useMemo(() => fields.filter(f => f.required).map(f => f.name), [fields]);

  const findNaicsHandler = async () => {
    const description = form?.['companydescription'];
    if (!description) return toast.error('Please enter a description first');
    try {
      const res = await findNaicsToMccDetails({ description }).unwrap();
      if (res.success) {
        setNaicsApiData(res?.data);
        setShowNaicsToMccDetails(true);
      }
    } catch (error) {
      console.log('Error finding NAICS:', error);
      toast.error(error?.data?.message || 'Failed to find NAICS code');
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (naicsInputRef.current && !naicsInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        const fieldValueFromLookupData = lookupData?.find(item => item.name === field.name)?.result;
        initialForm[field.name] = reduxData
          ? reduxData[field.name]
          : fieldValueFromLookupData
            ? fieldValueFromLookupData
            : '';
      });
      setForm(initialForm);
    }
  }, [fields, lookupData, name, reduxData]);

  // checking is all required fields are filled or not
  // ---------------------------------------------------
  useEffect(() => {
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
    const isNaicsFilled = naicsToMccDetails.NAICS;
    const isAllRequiredFieldsFilled = allFilled && isNaicsFilled;
    setIsAllRequiredFieldsFilled(isAllRequiredFieldsFilled);
  }, [form, naicsToMccDetails?.NAICS, requiredNames]);

  return (
    <div className="mt-14 h-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{name}</p>

        <div className="flex gap-2">
          <Button
            onClick={() => saveInProgress({ data: { ...form, naics: naicsToMccDetails }, name: title })}
            label={'Save in Draft'}
          />
          {user?._id && user.role !== 'guest' && (
            <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
          )}
          <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
        </div>
      </div>

      {step?.ai_formatting && (
        <div className="flex items-end gap-3">
          <div
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
              <div key={index} className="mt-4">
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
                label="Find NAICS"
                className={`text-nowrap ${isLoading && 'pointer-events-none opacity-30'}`}
                disabled={isLoading}
                onClick={findNaicsHandler}
              />
            </div>
            {showSuggestions && (
              <div className="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
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
          <div className="">{isSignature && <SignatureBox inSection={true} signUrl={signUrl} sectionId={_id} />}</div>
        </div>
      </div>
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              className={`${(!isAllRequiredFieldsFilled || loadingNext || (isSignature && !signUrl)) && 'pointer-events-none cursor-not-allowed opacity-50'}`}
              disabled={!isAllRequiredFieldsFilled || loadingNext || (isSignature && !signUrl)}
              label={
                isAllRequiredFieldsFilled || loadingNext || (isSignature && !signUrl)
                  ? 'Next'
                  : 'Some Required Fields are Missing'
              }
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
    setShowNaicsToMccDetails(true);
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
                className={`border-frameColor h-[45px] w-full cursor-pointer! rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base`}
              />
            </button>
          ))}
        </div>
      </section>
      <div className="flex w-full items-center justify-end">
        <Button label="Save Best Match" onClick={() => saveHandler(naicsApiData?.bestMatch)} />
      </div>
    </div>
  );
};
