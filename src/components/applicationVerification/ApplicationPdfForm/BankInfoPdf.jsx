import { FIELD_TYPES } from '@/data/constants';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
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

function BankInfoPdf({ name, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) {
  const [error] = useState(null);

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error('Please select a file');

      if (file) {
        // const oldSign = form?.['signature'];
        const oldSign = formInnerData?.[sectionKey]?.['signature'];
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error('File Not Deleted Please Try Again');
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error('File Not Uploaded Please Try Again');
        }
        // setForm(prev => ({ ...prev, signature: res }));
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
  //   if (fields && fields.length > 0) {
  //     const initialForm = {};
  //     fields.forEach(field => {
  //       initialForm[field.name] = reduxData ? reduxData[field.name] || '' : '';
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
  // }, [fields, isSignature, name, reduxData]);

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
      </div>
      {step?.ai_formatting && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting,
            }}
          />
        </div>
      )}

      {fields?.length > 0 &&
        fields.map((field, index) => {
          if (field.name === 'bank_routing_number') {
            return (
              <div key={index}>
                <div className="mt-4 flex items-center gap-2">
                  <OtherInputType
                    field={field}
                    placeholder={field.placeholder}
                    form={formInnerData?.[sectionKey]}
                    setForm={setFormInnerData}
                    sectionKey={sectionKey}
                    className="flex-1"
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            );
          }

          if (field.name === 'confirm_bank_account_number') {
            const isMatch = formInnerData?.[sectionKey]?.bank_account_number && formInnerData?.[sectionKey]?.[field.name] === formInnerData?.[sectionKey]?.bank_account_number;
            return (
              <div key={index} className="relative mt-4">
                <OtherInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className="w-full pr-10"
                  isConfirmField
                />
                <div className="mt-2 flex items-center gap-2">
                  {formInnerData?.[sectionKey]?.[field.name] && (
                    <span className="">
                      {isMatch ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </span>
                  )}
                  <p className="text-xs text-gray-500">Please type your account number manually (no copy/paste).</p>
                </div>
              </div>
            );
          }

          if (field.name === 'bank_account_holder_name') {
            return (
              <div key={index} className="relative mt-4">
                <OtherInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className="w-full"
                />
              </div>
            );
          }

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
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4">
                <RadioInputType field={field} form={formInnerData?.[sectionKey]} setForm={setFormInnerData} sectionKey={sectionKey} className={''} />
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

export default BankInfoPdf;
