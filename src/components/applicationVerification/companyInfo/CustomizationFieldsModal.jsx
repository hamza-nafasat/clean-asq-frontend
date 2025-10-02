import MakeFieldDataCustom from '@/components/shared/MakeFieldDataCustom';
import Checkbox from '@/components/shared/small/Checkbox';
import { Button } from '@/components/ui/button';
import { useUpdateDeleteCreateFormFieldsMutation, useUpdateFormSectionMutation } from '@/redux/apis/formApis';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function CustomizationFieldsModal({
  onClose,
  fields,
  sectionId,
  formRefetch,
  suggestions,
  isArticleForm,
  isSignature = false,
}) {
  const [fieldsData, setFieldsData] = useState([]);
  const [customizeForm, { isLoading }] = useUpdateDeleteCreateFormFieldsMutation();
  const [updateSection] = useUpdateFormSectionMutation();
  const [signatureEnabling, setSignatureEnabling] = useState(false);

  const handleUpdateSignature = async e => {
    setSignatureEnabling(true);
    const isSignature = e.target.checked;
    try {
      const res = await updateSection({ _id: sectionId, data: { isSignature } }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
      }
    } catch (error) {
      console.log('Error while updating signature', error);
    } finally {
      setSignatureEnabling(false);
    }
  };

  const addNewFieldHandler = () => setFieldsData(prev => [...prev, { label: '', name: '', type: 'text' }]);

  const saveFormHandler = async fieldsData => {
    try {
      const res = await customizeForm({ sectionId, fieldsData }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        onClose();
      }
    } catch (error) {
      console.log('Error while updating form fields', error);
    }
  };

  useEffect(() => {
    if (fields?.length > 0) {
      setFieldsData(fields);
    }
  }, [fields]);

  return (
    <>
      <p className="bg-primary py-2 text-center text-2xl font-medium text-white">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <MakeFieldDataCustom
              isArticleForm={isArticleForm}
              field={field}
              fieldsData={fieldsData}
              setFieldsData={setFieldsData}
              index={index}
              suggestions={suggestions}
            />
          </div>
        ))}
      <Checkbox
        id="signature"
        label="Enable Signature for this section"
        checked={isSignature}
        disabled={signatureEnabling}
        className={`${signatureEnabling ? 'pointer-events-none opacity-30' : ''}`}
        onChange={!signatureEnabling ? handleUpdateSignature : () => {}}
      />
      <div className="mt-6 flex w-full items-center justify-between gap-2">
        {!isArticleForm && (
          <Button className="bg-primary w-[45%] cursor-pointer text-white" onClick={addNewFieldHandler}>
            Add New Field
          </Button>
        )}
        <Button
          onClick={() => saveFormHandler(fieldsData)}
          disabled={isLoading}
          className={`bg-primary cursor-pointer text-white ${isArticleForm ? 'w-full' : 'w-[45%]'}`}
        >
          Save Form
        </Button>
      </div>
    </>
  );
}

export default CustomizationFieldsModal;
