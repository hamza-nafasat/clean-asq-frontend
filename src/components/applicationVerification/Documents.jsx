import FileUploader from './Documents/FileUploader';
import Button from '../shared/small/Button';
import { useState } from 'react';

function Documents({ name, currentStep, totalSteps, handleNext, handlePrevious, handleSubmit }) {
  const [file, setFile] = useState(null);
  const handleFileSelect = file => {
    console.log('Selected file:', file);
    setFile(file);
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
            <Button label={'Next'} onClick={() => handleNext({ data: { file }, name })} />
          ) : (
            <Button label={'Submit'} onClick={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;
