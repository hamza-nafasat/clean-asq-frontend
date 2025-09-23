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
import SignatureBox from '../shared/SignatureBox';

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

  // Fetch AI help on component mount
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      if (!idMissionData?.state) return;

      try {
        setIsAiLoading(true);
        const res = await formateTextInMarkDown({
          text: `List the specific documents required for business verification in ${idMissionData.state}. 
          Include document types, formats accepted, and any size or quality requirements. 
          Be concise and use bullet points.`,
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
  }, [idMissionData?.state, formateTextInMarkDown]);

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
        <div className="flex items-center justify-between">
          <h1 className="text-textPrimary text-2xl font-semibold">{name}</h1>
          <div className="flex gap-2">
            {user?._id && user.role !== 'guest' && (
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
            )}
            <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
          </div>
        </div>

        {/* Show required documents section */}
        {showRequiredDocs && aiResponse && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-800">Documents required for {idMissionData?.state || 'your state'}</h3>
              <button 
                onClick={() => setShowRequiredDocs(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Hide
              </button>
            </div>
            <div 
              className="prose mt-2 max-w-none text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: aiResponse }}
            />
          </div>
        )}

        {/* Custom AI help section */}
        {!showRequiredDocs && (
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowRequiredDocs(true)}
              label="Show Required Documents"
            />
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
          }
        })}
      </div>
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
