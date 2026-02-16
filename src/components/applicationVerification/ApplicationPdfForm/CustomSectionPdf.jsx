import { FIELD_TYPES } from '@/data/constants';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { toast } from 'react-toastify';
import SignatureBox from '../../shared/SignatureBox';
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from './shared/DynamicFieldForPdf';

function CustomSectionPdf({ fields, name, step, isSignature, formInnerData, setFormInnerData, sectionKey }) {

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error('Please select a file');
      if (file) {
        const oldSign = formInnerData?.[sectionKey]?.['signature'];
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error('File Not Deleted Please Try Again');
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error('File Not Uploaded Please Try Again');
        }
        setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], signature: res } }));
        toast.success('Signature uploaded successfully');
      }
    } catch (error) {
      console.log('error while uploading signature', error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  // useEffect(() => {
  //   const formFields = {};
  //   if (fields?.length) {
  //     fields?.forEach(field => {
  //       formFields[field?.name] = reduxData?.[field?.name] || '';
  //     });
  //     setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], ...formFields } }));
  //   }
  //   if (isSignature) {
  //     const isSignatureExistingData = {};
  //     if (reduxData?.signature?.publicId) isSignatureExistingData.publicId = reduxData?.signature?.publicId;
  //     if (reduxData?.signature?.secureUrl) isSignatureExistingData.secureUrl = reduxData?.signature?.secureUrl;
  //     if (reduxData?.signature?.resourceType) isSignatureExistingData.resourceType = reduxData?.signature?.resourceType;
  //     setFormInnerData(prev => ({ ...prev, [sectionKey]: { ...prev?.[sectionKey], signature: isSignatureExistingData?.publicId ? isSignatureExistingData : { publicId: '', secureUrl: '', resourceType: '' } } }));
  //   }
  // }, [fields, isSignature, reduxData, sectionKey, setFormInnerData]);

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>

      {step?.ai_formatting && (
        <div className="flex w-full items-end justify-between gap-3">
          <div
            className="mt-2 mb-4 w-full"
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting,
            }}
          />
        </div>
      )}
      <div className="mt-6 flex flex-col gap-4">
        {fields?.map((field, index) => {
          if (field.name === 'main_owner_own_25_percent_or_more' || field.type === 'block') return null;
          if (field.type === FIELD_TYPES.SELECT) {
            return (
              <div key={index} className="mt-4">
                <SelectInputType field={field} form={formInnerData?.[sectionKey]} setForm={setFormInnerData} sectionKey={sectionKey} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType field={field} form={formInnerData?.[sectionKey]} setForm={setFormInnerData} sectionKey={sectionKey} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.FILE) {
            return (
              <div key={index} className="mt-4">
                <FileInputType field={field} form={formInnerData?.[sectionKey]} setForm={setFormInnerData} sectionKey={sectionKey} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.FILE) {
            return (
              <div key={index} className="mt-4">
                <FileInputType field={field} form={formInnerData?.[sectionKey]} setForm={setFormInnerData} sectionKey={sectionKey} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4">
                <RadioInputType field={field} form={formInnerData?.[sectionKey]} setForm={setFormInnerData} sectionKey={sectionKey} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType field={field} form={formInnerData?.[sectionKey]} setForm={setFormInnerData} sectionKey={sectionKey} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <CheckboxInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
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
                form={formInnerData?.[sectionKey]}
                setForm={setFormInnerData}
                sectionKey={sectionKey}
                className={''}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            isPdf={true}
            onSave={signatureUploadHandler}
            oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.secureUrl || ''}
          />
        )}
      </div>
    </div>
  );
}

export default CustomSectionPdf;
