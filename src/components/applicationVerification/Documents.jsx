import { useFormateTextInMarkDownMutation, useUpdateFormSectionMutation } from '@/redux/apis/formApis';
import { updateFileData } from '@/redux/slices/formSlice';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import SignatureBox from '../shared/SignatureBox';
import Button from '../shared/small/Button';
import { AiHelpModal, OtherInputType } from '../shared/small/DynamicField';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal';
import Modal from '../shared/small/Modal';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';
import FileUploader from './Documents/FileUploader';

function Documents({
  _id,
  name,
  currentStep,
  totalSteps,
  handleNext,
  handlePrevious,
  handleSubmit,
  formLoading,
  fields,
  reduxData,
  title,
  formRefetch,
  // saveInProgress,
  step,
  isSignature,
  signUrl,
}) {
  const { user, idMissionData } = useSelector(state => state.auth);
  const { formData } = useSelector(state => state?.form);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const dispatch = useDispatch();
  const [fileFieldName, setFileFieldName] = useState('');
  const [loadingNext, setLoadingNext] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});
  const [openAiHelpModal, setOpenAiHelpModal] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formateTextInMarkDown] = useFormateTextInMarkDownMutation();
  const [showRequiredDocs, setShowRequiredDocs] = useState(true);
  const [urls, setUrls] = useState([]);
  const [aiPromptModal, setAiPromptModal] = useState(false);

  // Generate the AI prompt
  const generateAiPrompt = useCallback(() => {
    const companyName = idMissionData?.companyTitle || 'your company';
    const state = idMissionData?.state || 'your state';
    const prompt = step?.aiCustomizablePrompt || '';
    // return `how do I find online images/copies of the articles of incorporation or organization for ${companyName} in ${state} via the state's entity search website?`;
    return prompt?.replace('${companyName}', companyName).replace('${state}', state);
  }, [idMissionData?.companyTitle, idMissionData?.state, step?.aiCustomizablePrompt]);

  // Fetch AI help on component mount
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      if (!idMissionData?.state) return;

      try {
        setIsAiLoading(true);
        const prompt = generateAiPrompt();
        const res = await formateTextInMarkDown({
          text: prompt,
        }).unwrap();

        if (res.success) {
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
  }, [idMissionData?.state, formateTextInMarkDown, generateAiPrompt]);

  const handleFileSelect = file => {
    if (!file) return toast.error('Please select a file');
    setForm(prev => ({ ...prev, [fileFieldName]: file }));
  };
  const updateFileDataHandler = () => {
    if (!form?.[fileFieldName]) return toast.error('Please select a file');
    dispatch(updateFileData({ name, file: form[fileFieldName] }));
    dispatch(updateFileData({ name, file: form[fileFieldName] }));
    handleNext({ data: { ...form, [fileFieldName]: form[fileFieldName] }, name: title, setLoadingNext });
  };
  const submitFileDataHandler = () => {
    if (!form?.[fileFieldName]) return toast.error('Please select a file');
    dispatch(updateFileData({ name, file: form[fileFieldName] }));
    handleSubmit({ data: { [fileFieldName]: form[fileFieldName] }, name: title, setLoadingNext });
  };

  useEffect(() => {
    if (fields && fields.length > 0) {
      const initialForm = {};
      fields.forEach(field => {
        if (field.type === 'file') {
          setFileFieldName(field.name);
          initialForm[field?.name] = reduxData.file ? reduxData.file || '' : '';
        } else {
          const myRedux = formData?.[title];
          initialForm[field?.name] = myRedux?.[field?.name] || '';
        }
      });
      setForm(initialForm);
    }
  }, [fields, formData, name, reduxData, title]);

  useEffect(() => {
    if (form?.article_of_incorporation_urls) {
      setUrls(form?.article_of_incorporation_urls?.split(',') || []);
    } else {
      setUrls([]);
    }
  }, [form?.article_of_incorporation_urls]);

  return (
    <div className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-textPrimary text-2xl font-semibold">{name}</h1>
          <div className="flex gap-2">
            {user?._id && user.role !== 'guest' && (
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
            )}
            <Button onClick={() => setAiPromptModal(true)} label={'Customize Prompt'} />
            <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
          </div>
        </div>
        {aiPromptModal && (
          <Modal title="Customize Prompt" onClose={() => setAiPromptModal(false)}>
            <AiPromptCustomizablePrompt
              aiCustomizablePrompt={step?.aiCustomizablePrompt}
              sectionId={step?._id}
              aiPromptModal={aiPromptModal}
              setAiPromptModal={setAiPromptModal}
            />
          </Modal>
        )}

        {/* Show required documents section */}
        {showRequiredDocs && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-medium text-blue-800">
                  How to Find Your Articles of Incorporation/Organization
                </h3>
                <div className="mt-2 rounded-md bg-blue-100 p-3">
                  <p className="mt-1 font-mono text-sm text-blue-900">{generateAiPrompt()}</p>
                </div>
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
        {updateSectionFromatingModal && (
          <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
            <EditSectionDisplayTextFromatingModal step={step} />
          </Modal>
        )}
        {step?.ai_formatting && (
          <div className="w-full">
            <div dangerouslySetInnerHTML={{ __html: step.ai_formatting }} />
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
                {field?.ai_formatting && field?.isDisplayText && (
                  <div className="flex h-full w-full flex-col gap-4 p-4 pb-0">
                    <div className="" dangerouslySetInnerHTML={{ __html: field?.ai_formatting ?? '' }} />
                  </div>
                )}
                {field?.aiHelp && (
                  <div className="flex w-full justify-end">
                    <Button label="AI Help" className="text-nowrap" onClick={() => setOpenAiHelpModal(true)} />
                  </div>
                )}
                <FileUploader label={field?.label} file={form[fileFieldName]} onFileSelect={handleFileSelect} />
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
      <div className="mt-4">{isSignature && <SignatureBox inSection={true} signUrl={signUrl} sectionId={_id} />}</div>

      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              disabled={loadingNext || (isSignature && !signUrl)}
              className={`${loadingNext || (isSignature && !signUrl && 'pinter-events-none cursor-not-allowed opacity-20')}`}
              label={'Next'}
              onClick={updateFileDataHandler}
            />
          ) : (
            <Button
              disabled={formLoading || loadingNext}
              className={`${(formLoading || loadingNext) && 'pinter-events-none cursor-not-allowed opacity-20'}`}
              label={'Submit'}
              onClick={submitFileDataHandler}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={_id}
            fields={fields}
            isArticleForm={true}
            formRefetch={formRefetch}
            isSignature={isSignature}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default Documents;

export const AiPromptCustomizablePrompt = ({ aiCustomizablePrompt, sectionId, setAiPromptModal }) => {
  const [prompt, setPrompt] = useState(aiCustomizablePrompt || '');
  const [updateFormSection, { isLoading: isUpdating }] = useUpdateFormSectionMutation();

  const insertVariable = variable => {
    setPrompt(prev => prev + ` ${variable}`);
  };

  const updateFormSectionHandler = async () => {
    try {
      if (!prompt) return toast.error('Please enter display text and AI formatting');
      const res = await updateFormSection({
        _id: sectionId,
        data: { aiCustomizablePrompt: prompt },
      }).unwrap();
      if (res.success) {
        toast.success('Section Updated Successfully');
        setAiPromptModal(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to update section');
    }
  };
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Input Area */}
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Enter your custom prompt
        </label>
        <textarea
          id="prompt"
          rows={5}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder="Write your AI prompt here..."
        />
      </div>

      {/* Dynamic Variables */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Available variables:</span>
        <div className="flex gap-3">
          <Button label={`companyName`} type="button" onClick={() => insertVariable('${companyName}')} />
          <Button label={`state`} type="button" onClick={() => insertVariable('${state}')} />
        </div>
        <p className="text-xs text-gray-500">
          Click to insert variables into your prompt. These will be dynamically replaced by real values.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={() => setAiPromptModal(false)} variant="secondary" label={'Cancel'} />
        <Button onClick={updateFormSectionHandler} label={isUpdating ? 'Saving...' : 'Save'} />
      </div>
    </div>
  );
};
