import { FIELD_TYPES } from '@/data/constants';
import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '@/components/shared/small/DynamicField.jsx';
import Modal from '@/components/shared/small/Modal.jsx';
import Button from '@/components/shared/small/Button.jsx';

function FormHiddenSection() {
  const params = useParams();
  const formId = params.formId;
  const sectionName = params.sectionName;
  const { user } = useSelector(state => state.auth);
  const { form: formData } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});
  const [section, setSection] = useState(null);

  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  // const requiredNames = useMemo(() => fields.filter(f => f.required).map(f => f.name), [fields]);

  const isCreator = user?._id && user?._id === formData?.data?.owner && user?.role !== 'guest';

  useEffect(() => {
    if (formData?.data?.sections) {
      const section = formData?.data?.sections?.find(
        section => section?.name?.toLowerCase() === sectionName?.toLowerCase() && section?.isHidden
      );
      if (section) setSection(section);
    }
  }, [formData?.data?.sections, sectionName]);
  // Close suggestions when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = event => {
  //     if (naicsInputRef.current && !naicsInputRef.current.contains(event.target)) setShowSuggestions(false);
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  // useEffect(() => {
  //   if (fields && fields.length > 0) {
  //     const lookupData = formData?.company_lookup_data;
  //     const initialForm = {};
  //     let isDateField = false;
  //     fields.forEach(field => {
  //       let fieldValueFromLookupData = lookupData?.find(item => {
  //         const fieldName = field?.name?.trim()?.toLowerCase();
  //         const itemName = item?.name?.trim()?.toLowerCase();
  //         if (itemName == fieldName && itemName?.includes('date')) isDateField = true;
  //         return fieldName === itemName;
  //       })?.result;
  //       if (isDateField) {
  //         let formatedData = fieldValueFromLookupData
  //           ? new Date(fieldValueFromLookupData)?.toISOString()?.split('T')?.[0]
  //           : '';
  //         isDateField = false;
  //         console.log('asdfakjsljd;fkjasldf', fieldValueFromLookupData);
  //         initialForm[field.name] = reduxData?.[field?.name] || formatedData || '';
  //       } else {
  //         initialForm[field.name] = reduxData?.[field?.name] || fieldValueFromLookupData || '';
  //       }
  //     });
  //     setForm(initialForm);
  //   }
  //   if (isSignature) {
  //     const isSignatureExistingData = {};
  //     if (reduxData?.signature?.publicId) isSignatureExistingData.publicId = reduxData?.signature?.publicId;
  //     if (reduxData?.signature?.secureUrl) isSignatureExistingData.secureUrl = reduxData?.signature?.secureUrl;
  //     if (reduxData?.signature?.resourceType) isSignatureExistingData.resourceType = reduxData?.signature?.resourceType;
  //     setForm(prev => ({
  //       ...prev,
  //       ['signature']: isSignatureExistingData?.publicId
  //         ? isSignatureExistingData
  //         : { publicId: '', secureUrl: '', resourceType: '' },
  //     }));
  //   }
  // }, [fields, formData?.company_lookup_data, isSignature, reduxData]);

  // // checking is all required fields are filled or not
  // // ---------------------------------------------------
  // useEffect(() => {
  //   if (isCreator) {
  //     setIsAllRequiredFieldsFilled(true);
  //     return;
  //   }
  //   const allFilled = requiredNames.every(name => {
  //     const val = form[name];
  //     if (val == null) return false;
  //     if (typeof val === 'string') return val.trim() !== '';
  //     if (Array.isArray(val))
  //       return (
  //         val.length > 0 &&
  //         val.every(item =>
  //           typeof item === 'object'
  //             ? Object.values(item).every(v => v?.toString().trim() !== '')
  //             : item?.toString().trim() !== ''
  //         )
  //       );
  //     return true;
  //   });
  //   // check naics filled
  //   const isNaicsFilled = naicsToMccDetails.NAICS;
  //   let isCompanyStockSymbol = true;
  //   if (form?.['company_ownership_type'] == 'public') {
  //     isCompanyStockSymbol = false;
  //     if (form?.['stocksymbol']) isCompanyStockSymbol = true;
  //   }
  //   // check signature done
  //   let isSignatureDone = true;
  //   if (isSignature) {
  //     let dataOfSign = form?.['signature'];
  //     if (!dataOfSign?.publicId || !dataOfSign?.secureUrl || !dataOfSign?.resourceType) {
  //       isSignatureDone = false;
  //     }
  //   }

  //   const isAllRequiredFieldsFilled = allFilled && isNaicsFilled && isCompanyStockSymbol && isSignatureDone;
  //   setIsAllRequiredFieldsFilled(isAllRequiredFieldsFilled);
  // }, [form, isCreator, isSignature, naicsToMccDetails.NAICS, requiredNames]);

  // // for dangerouslySetInnerHTML redirection
  // useEffect(() => {
  //   const container = containerRef.current;
  //   if (!container) return;
  //   const links = container.querySelectorAll('a');
  //   links.forEach(link => {
  //     link.setAttribute('target', '_blank');
  //     link.setAttribute('rel', 'noopener noreferrer');
  //     link.addEventListener('click', e => {
  //       e.stopPropagation();
  //     });
  //   });
  // }, [step?.ai_formatting]);

  return (
    <div className="mt-14 h-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          {/* <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} /> */}
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{section?.title}</p>

        <div className="flex gap-2">
          {isCreator && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
            </>
          )}
        </div>
      </div>

      {/* {step?.ai_formatting && (
        <div className="mb-4 flex w-full items-end gap-3">
          <div
            className="w-full"
            ref={containerRef}
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting).replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )} */}

      {section?.fields?.length > 0 &&
        section?.fields?.map((field, index) => {
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

      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <Button className={`'pinter-events-none opacity-50'} cursor-not-allowed`} label={'Submit'} />
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          {/* <CustomizationFieldsModal
            suggestions={strategyKeys}
            sectionId={_id}
            fields={fields}
            formRefetch={formRefetch}
            isSignature={isSignature}
            section={step}
            onClose={() => setCustomizeModal(false)}
          /> */}
        </Modal>
      )}
    </div>
  );
}

export default FormHiddenSection;
