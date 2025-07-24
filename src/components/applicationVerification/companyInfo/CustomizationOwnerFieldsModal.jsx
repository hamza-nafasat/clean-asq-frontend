import MakeFieldDataCustomForOwner from '@/components/shared/MakeFieldDataCustomForOwner';
import { Button } from '@/components/ui/button';
import { useUpdateDeleteCreateFormFieldsMutation } from '@/redux/apis/formApis';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function CustomizationOwnerFieldsModal({ onClose, fields, blocks, sectionId, formRefetch }) {
  const [fieldsData, setFieldsData] = useState([]);
  const [blockFieldsData, setBlockFieldsData] = useState([]);
  const [customizeForm, { isLoading }] = useUpdateDeleteCreateFormFieldsMutation();

  const saveFormHandler = async () => {
    try {
      const res = await customizeForm({ sectionId, ownerFieldsData: [...fieldsData, ...blockFieldsData] }).unwrap();
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
    if (blocks?.length > 0) {
      const allFieldsData = [];
      blocks?.forEach(block => {
        block?.fields?.forEach(field => {
          allFieldsData.push(field);
        });
      });
      setBlockFieldsData(allFieldsData);
    }
  }, [blocks, fields]);

  let fieldIndex = 0;

  return (
    <>
      <p className="bg-primary py-2 text-center text-2xl font-medium text-white">Customization</p>
      <p className="text-center text-base font-normal">Customize your section for applicants</p>
      {fieldsData?.length > 0 &&
        fieldsData?.map((field, index) => (
          <div key={index} className="mt-6 flex flex-col gap-4">
            <MakeFieldDataCustomForOwner fieldsData={fieldsData} setFieldsData={setFieldsData} index={index} />
          </div>
        ))}
      {blocks?.length > 0 && (
        <div className="my-6 bg-[#E0E0E0] p-4">
          <h3 className="bg-primary py-2 text-center text-2xl font-medium text-white">Update Fields For Blocks</h3>
          <div className="flex flex-col gap-8">
            {blocks?.map((block, index) => {
              return (
                <div key={index} className="my-5 bg-yellow-50 py-2">
                  <p className="text-textPrimary text-center text-2xl font-medium capitalize">
                    {block?.name?.replaceAll('_', ' ')}
                  </p>
                  <p className="text-center text-base font-normal">{block?.description}</p>
                  {block?.fields?.map((f, i) => {
                    if (i !== index) fieldIndex++;
                    return (
                      <div key={i} className="mt-6 flex flex-col gap-4">
                        <MakeFieldDataCustomForOwner
                          fieldsData={blockFieldsData}
                          setFieldsData={setBlockFieldsData}
                          index={fieldIndex}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-6 flex w-full justify-between gap-2">
        <Button
          onClick={() => saveFormHandler([...fieldsData])}
          disabled={isLoading}
          className={`bg-primary w-full cursor-pointer text-white`}
        >
          Save Form
        </Button>
      </div>
    </>
  );
}

export default CustomizationOwnerFieldsModal;
