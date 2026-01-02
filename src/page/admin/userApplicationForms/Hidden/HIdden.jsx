import { FIELD_TYPES } from '@/data/constants';
import { useGetSingleFormQueryQuery } from '@/redux/apis/formApis';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '@/components/shared/small/DynamicField.jsx';
import Modal from '@/components/shared/small/Modal.jsx';
import Button from '@/components/shared/small/Button.jsx';
import CustomizationFieldsModal from '@/components/applicationVerification/companyInfo/CustomizationFieldsModal.jsx';
import { EditSectionDisplayTextFromatingModal } from '@/components/shared/small/EditSectionDisplayTextFromatingModal.jsx';

function FormHiddenSection() {
  const params = useParams();
  const formId = params.formId;
  const sectionKey = params.sectionKey?.toLowerCase();
  const { user } = useSelector(state => state.auth);
  const { data: formData, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId }, { skip: !formId });
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});
  const [section, setSection] = useState({});
  const containerRef = useRef(null);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);

  const isCreator = user?._id && user?._id === formData?.data?.owner && user?.role !== 'guest';

  useEffect(() => {
    if (formData?.data?.sections) {
      const section = formData?.data?.sections?.find(
        section => section?.key?.toLowerCase() === sectionKey?.toLowerCase() && section?.isHidden
      );
      if (section) setSection(section);
    }
  }, [formData?.data?.sections, sectionKey]);

  return (
    <div className="mt-14 h-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={section} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{section?.name}</p>

        <div className="flex gap-2">
          {isCreator && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={'Customize'} />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label={'Update Display Text'} />
            </>
          )}
        </div>
      </div>

      {section?.ai_formatting && (
        <div className="mb-4 flex w-full items-end gap-3">
          <div
            className="w-full"
            ref={containerRef}
            dangerouslySetInnerHTML={{
              __html: String(section?.ai_formatting).replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match;
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}

      {section?.fields?.length > 0 &&
        section?.fields?.map((field, index) => {
          if (field.type === FIELD_TYPES.SELECT) {
            return (
              <div key={index} className="mt-4">
                <SelectInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4 flex flex-col gap-2">
                <RadioInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType field={field} form={form} setForm={setForm} className={''} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <CheckboxInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={form}
                  setForm={setForm}
                  className={''}
                />
              </div>
            );
          }
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
        })}

      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <Button className={`'pinter-events-none opacity-50'} cursor-not-allowed`} label={'Submit'} />
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={section?._id}
            fields={section?.fields}
            formRefetch={formRefetch}
            isSignature={section?.isSignature}
            section={section}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default FormHiddenSection;
