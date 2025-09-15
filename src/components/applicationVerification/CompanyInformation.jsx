import { FIELD_TYPES } from '@/data/constants';
import { useEffect, useState } from 'react';
import Button from '../shared/small/Button';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '../shared/small/DynamicField';
import Modal from '../shared/small/Modal';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFindNaicAndMccMutation, useGetAllSearchStrategiesQuery } from '@/redux/apis/formApis';
import { toast } from 'react-toastify';

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
}) {
  const { lookupData } = useSelector(state => state?.company);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [form, setForm] = useState({});
  const [loadingNext, setLoadingNext] = useState(false);
  const [naicsToMccDetails, setNaicsToMccDetails] = useState({
    NAICS: reduxData?.naics?.NAICS || '',
    MCC: reduxData?.naics?.MCC || '',
  });
  const [showNaicsToMccDetails, setShowNaicsToMccDetails] = useState(true);
  const [naicsApiData, setNaicsApiData] = useState({ bestMatch: {}, otherMatches: [] });
  const [findNaicsToMccDetails, { isLoading }] = useFindNaicAndMccMutation();
  const [strategyKeys, setStrategyKeys] = useState([]);
  const { data: strategyKeysData } = useGetAllSearchStrategiesQuery();

  useEffect(() => {
    if (strategyKeysData?.data) {
      setStrategyKeys(strategyKeysData?.data?.map(item => item?.searchObjectKey));
    }
  }, [strategyKeysData]);

  // console.log('lookup data', lookupData);

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
      console.log('Error sending OTP:', error);
      toast.error(error?.data?.message || 'Failed to send OTP');
    }
  };

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
      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{name}</p>
        <div className="flex gap-2">
          <Button
            onClick={() => saveInProgress({ data: { ...form, naics: naicsToMccDetails }, name: title })}
            label={'Save in Draft'}
          />
          <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
        </div>
      </div>

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
        <div className={`'mt-2' flex w-full gap-4`}>
          <input
            placeholder={'NAICS Code and Description'}
            type={'text'}
            value={naicsToMccDetails.NAICS}
            className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base`}
            onChange={e => setNaicsToMccDetails({ ...naicsToMccDetails, NAICS: e.target.value })}
          />
          <Button
            label="Find NAICS"
            className={`text-nowrap ${isLoading && 'pointer-events-none opacity-30'}`}
            disabled={isLoading}
            onClick={findNaicsHandler}
          />
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
              label={isAllRequiredFieldsFilled ? 'Next' : 'Some Required Fields are Missing'}
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
