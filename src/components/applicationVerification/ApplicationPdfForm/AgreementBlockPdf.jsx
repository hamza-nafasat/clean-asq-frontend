import { updateFormState } from '@/redux/slices/formSlice';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { unwrapResult } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import SignatureBox from '../../shared/SignatureBox';

function AggrementBlockPdf({ fields, name, title, saveInProgress, step, isSignature, reduxData }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({});

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
        if (!res.publicId || !res.secureUrl || !res.resourceType)
          return toast.error('File Not Uploaded Please Try Again');
        const action = await dispatch(updateFormState({ data: { signature: res }, name: title }));
        unwrapResult(action);
        setForm(prev => ({ ...prev, signature: res }));
        await saveInProgress({ data: { signature: res }, name: title });
        toast.success('Signature uploaded successfully');
      }
    } catch (error) {
      console.log('error while uploading signature', error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  useEffect(() => {
    const formFields = {};
    if (fields?.length) {
      fields?.forEach(field => {
        formFields[field?.name] = reduxData?.[field?.name] || '';
      });
      setForm(formFields);
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
  }, [fields, isSignature, reduxData]);

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>

      {step?.ai_formatting && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <div
            className="mt-2 w-full"
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}

      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            onSave={signatureUploadHandler}
            oldSignatureUrl={form?.signature?.secureUrl || ''}
            isPdf={true}
          />
        )}
      </div>
    </div>
  );
}

export default AggrementBlockPdf;
