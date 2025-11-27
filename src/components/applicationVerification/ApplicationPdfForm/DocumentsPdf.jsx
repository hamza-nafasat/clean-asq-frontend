import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SignatureBox from '../../shared/SignatureBox';
import Button from '../../shared/small/Button';
import { AiHelpModal, OtherInputType } from './shared/DynamicFieldForPdf';
import Modal from '../../shared/small/Modal';
import FileUploader from '../Documents/FileUploader';

function DocumentsPdf({ name, fields, title, step, isSignature }) {
  const { formData } = useSelector(state => state.form);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({});
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formateTextInMarkDown] = useFormateTextInMarkDownMutation();
  const [showRequiredDocs, setShowRequiredDocs] = useState(true);
  const [urls, setUrls] = useState([]);

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
  // Generate the AI prompt
  const generateAiPrompt = useCallback(() => {
    const companyLookupData = formData?.company_lookup_data;
    const prompt = step?.aiCustomizablePrompt || '';
    let newPrompt = prompt;
    prompt.split(' ').forEach(word => {
      if (word.startsWith('[') && word.endsWith(']')) {
        const exactWord = word.slice(1, -1);
        const lookupDataForWord = companyLookupData?.find(item => item?.name === exactWord)?.result;
        newPrompt = newPrompt.replace(word, (lookupDataForWord || word).toString());
      }
    });
    return newPrompt;
  }, [formData?.company_lookup_data, step?.aiCustomizablePrompt]);

  // Fetch AI help on component mount
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      try {
        setIsAiLoading(true);
        const prompt = generateAiPrompt();
        if (!prompt) return;
        const res = await formateTextInMarkDown({
          text: prompt,
        }).unwrap();

        if (res?.success) {
          setAiResponse(DOMPurify.sanitize(res.data));
        }
      } catch (error) {
        console.error('Error fetching required documents:', error);
        toast.error('Failed to load document requirements. Please try again later.');
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchRequiredDocuments();
  }, [formateTextInMarkDown, generateAiPrompt]);
  useEffect(() => {
    if (formData?.[step?.title]?.article_of_incorporation_urls)
      setUrls(formData?.[step?.title]?.article_of_incorporation_urls?.split(',') || []);
    else setUrls([]);
  }, [form.article_of_incorporation_urls, formData, step?.title]);

  return (
    <div className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-textPrimary text-2xl font-semibold">{name}</h1>
        </div>
        {step?.ai_formatting && (
          <div className="mb-4 w-full">
            <div dangerouslySetInnerHTML={{ __html: step.ai_formatting }} />
          </div>
        )}

        {/* Show required documents section */}
        {showRequiredDocs && aiResponse && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-medium text-blue-800">
                  How to Find Your Articles of Incorporation/Organization
                </h3>
              </div>
              <button
                onClick={() => setShowRequiredDocs(false)}
                className="h-fit text-blue-600 hover:text-blue-800"
                disabled={isAiLoading}
              >
                {isAiLoading ? 'Loading...' : 'Hide'}
              </button>
            </div>
            {isAiLoading ? (
              <div className="mt-4 flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            ) : aiResponse ? (
              <div
                className="prose mt-2 max-w-none text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: aiResponse }}
              />
            ) : (
              <p className="mt-2 text-sm text-gray-600">Unable to load document requirements at this time.</p>
            )}
          </div>
        )}
        {/* Custom AI help section */}
        {!showRequiredDocs && (
          <div className="mb-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowRequiredDocs(true)} label="Show Required Documents" />
          </div>
        )}
      </div>
      <div className="mt-6 w-full">
        {fields?.map((field, index) => {
          if (field.type === 'file') {
            return (
              <div className="flex w-full flex-col gap-4 p-6" key={index}>
                {openAiHelpModal && (
                  <Modal onClose={() => setOpenAiHelpModal(false)}>
                    <AiHelpModal
                      aiPrompt={field?.aiPrompt}
                      aiResponse={title === 'incorporation_article_blk' ? aiResponse : field?.aiResponse}
                      setOpenAiHelpModal={setOpenAiHelpModal}
                    />
                  </Modal>
                )}
                {field?.aiHelp && (
                  <div className="flex w-full justify-end">
                    <Button label="AI Help" className="text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
                  </div>
                )}
                <FileUploader label={field?.label} file={file} onFileSelect={setFile} />
                {field?.ai_formatting && field?.isDisplayText && (
                  <div className="flex w-full flex-col gap-4 p-4 pb-0">
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: field?.ai_formatting ?? '' }} />
                  </div>
                )}
              </div>
            );
          } else {
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
          }
        })}
      </div>
      {urls?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Uploaded URLs Preview</h3>
          <div className="mt-4 grid gap-3">
            {urls?.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm transition hover:shadow-md"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium text-blue-600 hover:underline"
                  title={url}
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            isPdf={true}
            onSave={signatureUploadHandler}
            oldSignatureUrl={form?.signature?.secureUrl || ''}
          />
        )}
      </div>
    </div>
  );
}

export default DocumentsPdf;
