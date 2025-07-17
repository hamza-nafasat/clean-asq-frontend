import MakeFieldDataCustom from '@/components/shared/MakeFieldDataCustom';
import { Button } from '@/components/ui/button';
import { useUpdateDeleteCreateFormFieldsMutation } from '@/redux/apis/formApis';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function Modal6({ onClose, fields, sectionId, formRefetch }) {
  const [fieldsData, setFieldsData] = useState([]);
  const [customizeForm, { isLoading }] = useUpdateDeleteCreateFormFieldsMutation();

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
      <p className="text-textPrimary text-center text-2xl font-medium">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <MakeFieldDataCustom field={field} fieldsData={fieldsData} setFieldsData={setFieldsData} index={index} />
          </div>
        ))}
      <div className="mt-6 flex w-full justify-between gap-2">
        <Button className="bg-primary w-[45%] cursor-pointer text-white" onClick={addNewFieldHandler}>
          Add New Field
        </Button>
        <Button
          onClick={() => saveFormHandler(fieldsData)}
          disabled={isLoading}
          className={`bg-primary w-[45%] cursor-pointer text-white`}
        >
          Save Form
        </Button>
      </div>
    </>
  );
}

export default Modal6;
