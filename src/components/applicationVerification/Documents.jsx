import FileUploader from './Documents/FileUploader';
import Button from '../shared/small/Button';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateFileData } from '@/redux/slices/formSlice';

function Documents({ name, currentStep, totalSteps, handleNext, handlePrevious, handleSubmit, formLoading }) {
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const handleFileSelect = file => {
    console.log('Selected file:', file);
    setFile(file);
  };
  const updateFileDataHandler = () => {
    if (!file) return toast.error('Please select a file');
    dispatch(updateFileData({ name, file }));
    handleNext({ data: { file }, name });
  };
  const submitFileDataHandler = () => {
    if (!file) return toast.error('Please select a file');
    dispatch(updateFileData({ name, file }));
    handleSubmit({ data: { file }, name });
  };
  return (
    <div className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <h1 className="text-textPrimary text-base">{name}</h1>
      <div className="mt-6 w-full">
        <h5 className="text-textPrimary text-base">
          Please upload a copy of your articles of incorporation (PDF or image file)
        </h5>

        <div className="w-full p-6">
          <FileUploader onFileSelect={handleFileSelect} />
        </div>
      </div>
      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={updateFileDataHandler} />
          ) : (
            <Button
              disabled={formLoading}
              className={`${formLoading && 'pinter-events-none cursor-not-allowed opacity-50'}`}
              label={'Submit'}
              onClick={submitFileDataHandler}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;
