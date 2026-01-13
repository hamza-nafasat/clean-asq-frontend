import CustomizationFieldsModal from '@/components/applicationVerification/companyInfo/CustomizationFieldsModal.jsx';
import Button from '@/components/shared/small/Button.jsx';
import CustomLoading from '@/components/shared/small/CustomLoading';
import {
  CheckboxInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from '@/components/shared/small/DynamicField.jsx';
import { EditSectionDisplayTextFromatingModal } from '@/components/shared/small/EditSectionDisplayTextFromatingModal.jsx';
import Modal from '@/components/shared/small/Modal.jsx';
import { FIELD_TYPES } from '@/data/constants';
import { useGetSpecialAccessOfSectionQuery, useSubmitSpecialAccessFormMutation } from '@/redux/apis/formApis';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function FormHiddenSection() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const accessToken = useSearchParams()?.[0]?.get('token');
  const sectionKey = params.sectionKey?.toLowerCase();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector(state => state.auth);
  const {
    data: formData,
    refetch: formRefetch,
    isLoading: isLoadingFormData,
    error: formError,
  } = useGetSpecialAccessOfSectionQuery(
    { formId, token: accessToken, sectionKey },
    { skip: !formId || !accessToken || !sectionKey }
  );
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});
  const [section, setSection] = useState({});
  const containerRef = useRef(null);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [submitSpecialAccessForm, { isLoading: isSubmittingSpecialAccessForm }] = useSubmitSpecialAccessFormMutation();

  const isCreator = user?._id && user?._id === formData?.data?.owner && user?.role !== 'guest';

  const handleSubmitSpecialAccessForm = useCallback(async () => {
    try {
      if (!accessToken || !sectionKey || !formId) return toast.error('Please provide all the required fields');
      const res = await submitSpecialAccessForm({ formId, token: accessToken, sectionKey, formData: form }).unwrap();
      if (res.success) {
        toast.success(res.message);
        navigate('/');
      } else {
        toast.error(res.message || 'Error while submitting special access form');
      }
    } catch (error) {
      console.log('error submitting special access form', error);
      toast.error(error?.data?.message || 'Error while submitting special access form');
    }
  }, [accessToken, sectionKey, formId, submitSpecialAccessForm, form, navigate]);

  useEffect(() => {
    setIsLoading(true);
    if (formData?.data?.sections) {
      const section = formData?.data?.sections?.find(
        section => section?.key?.toLowerCase() === sectionKey?.toLowerCase() && section?.isHidden
      );
      if (section) setSection(section);
    }
    setIsLoading(false);
  }, [formData?.data?.sections, sectionKey]);
  // showing error message if form error is not null
  useEffect(() => {
    if (formError) toast.error(formError?.data?.message || 'Error while fetching form data');
  }, [formError]);

  if (isLoading || isLoadingFormData) return <CustomLoading />;

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
            dangerouslySetIn
            nerHTML={{
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
        <Button
          className={`${isSubmittingSpecialAccessForm ? 'pinter-events-none opacity-50' : ''} cursor-not-allowed`}
          disabled={isSubmittingSpecialAccessForm}
          onClick={handleSubmitSpecialAccessForm}
          label={'Submit'}
        />
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
