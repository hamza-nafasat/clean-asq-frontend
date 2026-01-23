import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiMoreVertical } from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  useCreateEmailTemplateMutation,
  useUpdateSingleEmailTemplateMutation,
  useDeleteSingleEmailTemplateMutation,
  useGetAllEmailTemplatesQuery,
  useAttachTemplateToFormMutation,
  useUnAttachedFormsListQuery,
} from '@/redux/apis/emailTemplateApis';
import { useGetMyAllFormsQuery } from '@/redux/apis/formApis';
import DropdownCheckbox from '@/components/shared/DropdownCheckbox';
import CustomLoading from '@/components/shared/small/CustomLoading';

const emailTypes = [
  {
    label: 'Otp Email Template',
    value: 'otp_email_template',
  },
  {
    label: 'Old Beneficial Owners Email Template',
    value: 'old_beneficial_owners_email_template',
  },
  {
    label: 'New Beneficial Owners Email Template',
    value: 'new_beneficial_owners_email_template',
  },
  {
    label: 'Form Forwarded Email Template',
    value: 'form_forwarded_email_template',
  },
];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'script',
  'indent',
  'direction',
  'color',
  'background',
  'align',
  'link',
  'image',
];
function Email() {
  const [viewModalData, setViewModalData] = useState(null);

  const { data: applicationForms } = useGetMyAllFormsQuery();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editData, setEditData] = useState({
    templateName: '',
    subject: '',
    emailType: '',
    body: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const [createEmailTemplate] = useCreateEmailTemplateMutation();
  const [updateEmailTemplate] = useUpdateSingleEmailTemplateMutation();
  const [deleteEmailTemplate] = useDeleteSingleEmailTemplateMutation();
  const { data: emailTemplates, refetch: refetchEmailTemplates } = useGetAllEmailTemplatesQuery();
  const [isAttachFormModalOpen, setIsAttachFormModalOpen] = useState(false);
  const menuRef = useRef(null);

  const templates = emailTemplates?.data;

  const sedationKeywords = ['link', 'otp', 'email', 'password', 'frontEndUrl'];

  <ReactQuill
    className={`h-[200px] border ${!editData.body ? 'border-accent' : 'border-frameColor'}`}
    value={editData.body}
    onChange={value => handleChange('body', value)}
    modules={quillModules}
    formats={quillFormats}
    theme="snow"
    readOnly={isReadOnly}
  />;

  <div className="mt-2 flex flex-wrap gap-2 text-sm">
    {sedationKeywords?.map((keyword, idx) => (
      <span
        key={idx}
        className={`cursor-pointer rounded-md border px-2 py-1 ${editData.body.toLowerCase().includes(keyword.toLowerCase())
          ? 'border-green-400 bg-green-100'
          : 'border-gray-300 bg-gray-100'
          }`}
      >
        {keyword}
      </span>
    ))}
  </div>;

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    console.log('Saved Data:', editData);

    try {
      const res = isEdit
        ? await updateEmailTemplate({
          id: viewModalData?._id,
          ...editData,
        }).unwrap()
        : await createEmailTemplate(editData).unwrap();

      if (res?.success) {
        toast.success(res.message);
      }

      setIsEdit(false);
      setViewModalData(null);
      setEditData({ templateName: '', subject: '', emailType: '', body: '' });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save template');
    }
  };

  const handleEdit = item => {
    setIsEdit(true);
    setIsReadOnly(false);
    setViewModalData(item);
    setEditData(item);
    setMenuOpenId(null);
  };

  const handleAttachForms = item => {
    setIsAttachFormModalOpen(true);
    setSelectedTemplate(item);
    setMenuOpenId(null);
  };

  const handleView = item => {
    setIsReadOnly(true);
    setViewModalData(item);
    setEditData(item);
  };

  const handleCreate = () => {
    setIsReadOnly(false);
    setEditData({ templateName: '', subject: '', emailType: '', body: '' });
    setViewModalData({});
  };

  const handleDelete = async item => {
    try {
      const res = await deleteEmailTemplate({ emailTemplateId: item?._id }).unwrap();
      toast.success(res?.message || 'Deleted successfully');
      setMenuOpenId(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete template');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      {isAttachFormModalOpen && (
        <ModalForAttachForms
          refetchTemplates={refetchEmailTemplates}
          setIsAttachFormModalOpen={setIsAttachFormModalOpen}
          forms={applicationForms?.data}
          selectedTemplate={selectedTemplate}
        />
      )}
      {viewModalData && (
        <Modal
          onSave={!isReadOnly ? handleSave : () => setViewModalData(null)}
          saveButtonText={!isReadOnly ? 'Save' : 'Close'}
          title={isReadOnly ? 'Template Details' : viewModalData._id ? 'Edit Template' : 'Create Template'}
          onClose={() => {
            (setViewModalData(null), setIsEdit(false));
          }}
        >
          <div className="mt-4 space-y-4 overflow-auto">
            <TextField
              label="Template Name"
              value={editData.templateName}
              onChange={e => handleChange('templateName', e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? 'cursor-not-allowed' : ''}
            />

            <div className="mb-4">
              <label className="text-textPrimary mb-1 block text-sm font-medium">Email Type</label>
              <select
                name={'emailType'}
                value={editData.emailType}
                onChange={e => handleChange('emailType', e.target.value)}
                className={`border-frameColor h-[45px] w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-[50px] md:text-base`}
              >
                <option value="">Choose an option</option>
                {emailTypes?.map(opt => (
                  <option key={opt?.value} value={opt?.value}>
                    {opt?.label}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="Subject"
              value={editData.subject}
              onChange={e => handleChange('subject', e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? 'cursor-not-allowed' : ''}
            />

            <div className="custom-quill-wrapper">
              <ReactQuill
                className="custom-quill h-[200px]"
                value={editData.body}
                onChange={value => handleChange('body', value)}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                readOnly={isReadOnly}
                style={{
                  '--border-color': editData.body ? 'var(--frameColor)' : 'var(--accent)',
                }}
              />
            </div>

            <div className="mt-20">
              {!isReadOnly && (
                <div className="mt-2 mb-4 flex flex-wrap gap-2 text-sm">
                  {sedationKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      onClick={() => setEditData(prev => ({ ...prev, body: `${prev.body} {{${keyword}}}` }))}
                      className={`cursor-pointer rounded-md border px-2 py-1 ${editData.body.toLowerCase().includes(keyword.toLowerCase())
                        ? 'border-green-400 bg-green-100'
                        : 'border-gray-300 bg-gray-100'
                        }`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <div className="flex items-center justify-between">
        <h1 className="mb-6 text-2xl font-semibold">Email Templates</h1>
        <Button label="Create Email Template" onClick={handleCreate} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates?.map(item => (
          <div
            key={item?._id}
            className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="absolute top-4 right-4">
              <FiMoreVertical
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setMenuOpenId(menuOpenId === item._id ? null : item._id)}
              />
              {menuOpenId === item._id && (
                <div
                  ref={menuRef}
                  className="absolute top-6 right-0 z-50 w-32 rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  <button
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    onClick={() => handleAttachForms(item)}
                  >
                    Attach
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h2 className="mb-2 text-lg font-bold text-gray-800">{item.templateName}</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-700">Subject</p>
                <p>{item.subject}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Application</p>
                <p>{item.email}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Email Type</p>
                <p>{item.emailType}</p>
              </div>
            </div>
            <button
              onClick={() => handleView(item)}
              className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Email;

const ModalForAttachForms = React.memo(({ setIsAttachFormModalOpen, selectedTemplate }) => {
  const { data: unAttachedForms, isLoading: isLoadingUnAttachedForms } = useUnAttachedFormsListQuery(
    { emailTemplateId: selectedTemplate?._id },
    { skip: !selectedTemplate?._id }
  );
  const [selectedForms, setSelectedForms] = useState(selectedTemplate?.forms?.map(form => form._id) || []);
  const [attachEmailToForms, { isLoading }] = useAttachTemplateToFormMutation();

  const onSaveHandler = async () => {
    if (!selectedTemplate?._id) return toast.error('Please select template and forms');
    try {
      const res = await attachEmailToForms({
        emailTemplateId: selectedTemplate?._id,
        formIds: selectedForms?.length ? selectedForms : [],
      }).unwrap();
      if (res.success) {
        toast.success('Template attached to forms successfully');
        setIsAttachFormModalOpen(false);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to attach template to forms');
      console.log(error);
    }
  };

  return (
    <Modal isLoading={isLoading} onSave={onSaveHandler} onClose={() => setIsAttachFormModalOpen(false)}>
      {isLoadingUnAttachedForms ? (
        <CustomLoading />
      ) : (
        <div className="p-4 min-h-[30vh]">
          <h2 className="mb-4 text-lg font-semibold">Attach To Forms</h2>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Select Forms</label>
            <DropdownCheckbox
              options={unAttachedForms?.data?.map(item => ({ label: item?.name, value: item?._id }))}
              selected={selectedForms}
              defaultText={`Select Forms`}
              onSelect={vals => setSelectedForms(vals)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
});
