import FileUploader from './Documents/FileUploader';
import Button from '../shared/small/Button';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateFileData } from '@/redux/slices/formSlice';
import CustomizationFieldsModal from './companyInfo/CustomizationFieldsModal';

import Modal from '../shared/small/Modal';
import { AiHelpModal } from '../shared/small/DynamicField';
import { EditSectionDisplayTextFromatingModal } from '../shared/small/EditSectionDisplayTextFromatingModal';
import { PencilIcon } from 'lucide-react';
import { useFormateTextInMarkDownMutation } from '@/redux/apis/formApis';
import DOMPurify from 'dompurify';

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
}) {
  const { user } = useSelector(state => state.auth);
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
  const { idMissionData } = useSelector(state => state.auth);

  const handleFileSelect = file => {
    if (!file) return toast.error('Please select a file');
    setForm(prev => ({ ...prev, [fileFieldName]: file }));
  };
  const updateFileDataHandler = () => {
    if (!form?.[fileFieldName]) return toast.error('Please select a file');
    dispatch(updateFileData({ name, file: form[fileFieldName] }));
    handleNext({ data: { [fileFieldName]: form[fileFieldName] }, name: title, setLoadingNext });
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
          initialForm[field.name] = reduxData.file ? reduxData.file || '' : '';
        }
      });
      setForm(initialForm);
    }
  }, [fields, name, reduxData]);

  console.log('Documents form data:', form);

  return (
    <div className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <h1 className="text-textPrimary text-base">{name}</h1>
        <div className="flex w-full justify-end gap-2">
          {user?._id && user.role !== 'guest' && (
            <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
          )}
          <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
        </div>
        {updateSectionFromatingModal && (
          <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
            <EditSectionDisplayTextFromatingModal step={step} />
          </Modal>
        )}
        {step?.ai_formatting && (
          <div className="flex w-full gap-3">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{
                __html: step?.ai_formatting,
              }}
            />
          </div>
        )}
      </div>
      <div className="mt-6 w-full">
        {fields?.map((field, i) => {
          if (field.type === 'file') {
            return (
              <div className="flex w-full flex-col gap-4 p-6" key={i}>
                {openAiHelpModal && (
                  <Modal onClose={() => setOpenAiHelpModal(false)}>
                    <AiHelpModal
                      aiPrompt={field?.aiPrompt}
                      aiResponse={title === 'incorporation_article_blk' ? aiResponse : field?.aiResponse}
                      setOpenAiHelpModal={setOpenAiHelpModal}
                    />
                  </Modal>
                )}
                {title === 'incorporation_article_blk' ? (
                  <div className="mb-4 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Need help finding your Articles of Incorporation?</h3>
                      <Button 
                        label="Get Help" 
                        variant="outline" 
                        className="text-nowrap" 
                        onClick={async () => {
                          if (!idMissionData?.companyTitle || !idMissionData?.state) {
                            toast.error('Company information not found. Please complete previous sections first.');
                            return;
                          }
                          
                          try {
                            setIsAiLoading(true);
                            const res = await formateTextInMarkDown({
                              text: `You are an expert in business documentation. Provide a helpful, step-by-step guide to find the articles of incorporation for ${idMissionData.companyTitle} in ${idMissionData.state}. Include:
1. The official state website for business entity search
2. Step-by-step instructions
3. Any fees involved
4. Processing times
5. Alternative methods if online search is not available`
                            }).unwrap();
                            
                            if (res.success) {
                              const html = DOMPurify.sanitize(res.data);
                              setAiResponse(html);
                              setOpenAiHelpModal(true);
                            }
                          } catch (error) {
                            console.error('Error generating AI response:', error);
                            toast.error('Failed to generate help content. Please try again.');
                          } finally {
                            setIsAiLoading(false);
                          }
                        }}
                        loading={isAiLoading}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      We can help you locate the required documents if you don't have them handy.
                    </p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
                <FileUploader label={field?.label} file={form[fileFieldName]} onFileSelect={handleFileSelect} />
              </div>
            );
          }
        })}
      </div>
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button
              disabled={loadingNext}
              className={`${loadingNext && 'pinter-events-none cursor-not-allowed opacity-20'}`}
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
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default Documents;
