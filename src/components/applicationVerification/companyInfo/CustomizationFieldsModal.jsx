import MakeFieldDataCustom from '@/components/shared/MakeFieldDataCustom';
import { Button } from '@/components/ui/button';
import { useUpdateDeleteCreateFormFieldsMutation } from '@/redux/apis/formApis';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function CustomizationFieldsModal({ onClose, fields, blocks, sectionId, formRefetch }) {
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
      <p className="bg-primary py-2 text-center text-2xl font-medium text-white">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <MakeFieldDataCustom field={field} fieldsData={fieldsData} setFieldsData={setFieldsData} index={index} />
          </div>
        ))}
      {blocks?.length > 0 && (
        <div className="my-6 bg-[#E0E0E0] p-4">
          <h3 className="bg-primary py-2 text-center text-2xl font-medium text-white">Update Fields For Blocks</h3>
          <div className="flex flex-col gap-8">
            {blocks?.map((block, i) => {
              return (
                <div key={i} className="my-5 bg-yellow-50 py-2">
                  <p className="text-textPrimary text-center text-2xl font-medium capitalize">
                    {block?.name?.replaceAll('_', ' ')}
                  </p>
                  <p className="text-center text-base font-normal">{block?.description}</p>
                  {block?.fields?.map((field, index) => (
                    <div key={index} className="mt-6 flex flex-col gap-4">
                      <MakeFieldDataCustom
                        field={field}
                        fieldsData={fieldsData}
                        setFieldsData={setFieldsData}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
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

export default CustomizationFieldsModal;
