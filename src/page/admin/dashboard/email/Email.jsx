import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/small/Button';
import TextField from '@/components/shared/small/TextField';
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FiMoreVertical } from 'react-icons/fi';

function Email() {
  const [viewModalData, setViewModalData] = useState(null);
  const [editData, setEditData] = useState({
    templateName: '',
    subject: '',
    emailType: '',
    body: '',
  });
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const menuRef = useRef(null);

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

  const templates = [
    {
      id: 1,
      templateName: 'Welcome Template',
      subject: 'Welcome to our platform!',
      body: 'This is the welcome email body.',
      email: 'welcome@example.com',
      emailType: 'Welcome',
    },
    {
      id: 2,
      templateName: 'Reset Password',
      subject: 'Reset Your Password',
      body: 'Click to reset your password.',
      email: 'reset@example.com',
      emailType: 'Security',
    },
    {
      id: 3,
      templateName: 'Invoice Email',
      subject: 'Your Invoice',
      body: 'Your invoice is attached.',
      email: 'billing@example.com',
      emailType: 'Billing',
    },
  ];
  const sedationKeywords = ['relax', 'calm', 'soothe', 'tranquil', 'peaceful', 'comfort', 'quiet', 'restful'];

  <ReactQuill
    className={`h-[200px] border ${!editData.body ? 'border-accent' : 'border-frameColor'}`}
    value={editData.body}
    onChange={value => handleChange('body', value)}
    modules={quillModules}
    formats={quillFormats}
    theme="snow"
    readOnly={isReadOnly}
  />;

  {
  }
  <div className="mt-2 flex flex-wrap gap-2 text-sm">
    {sedationKeywords.map((keyword, idx) => (
      <span
        key={idx}
        className={`rounded-full border px-2 py-1 ${
          editData.body.toLowerCase().includes(keyword.toLowerCase())
            ? 'border-green-400 bg-green-100'
            : 'border-gray-300 bg-gray-100'
        }`}
      >
        {keyword}
      </span>
    ))}
  </div>;

  useEffect(() => {
    if (viewModalData) {
      setEditData({
        templateName: viewModalData.templateName || '',
        subject: viewModalData.subject || '',
        emailType: viewModalData.emailType || '',
        body: viewModalData.body || '',
      });
    }
  }, [viewModalData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saved Data:', editData);
    setViewModalData(null);
  };

  const handleEdit = item => {
    setIsReadOnly(false);
    setViewModalData(item);
    setMenuOpenId(null);
  };

  const handleView = item => {
    setIsReadOnly(true);
    setViewModalData(item);
  };

  const handleCreate = () => {
    setIsReadOnly(false);
    setEditData({ templateName: '', subject: '', emailType: '', body: '' });
    setViewModalData({});
  };

  const handleDelete = item => {
    console.log('Deleted:', item);
    setMenuOpenId(null);
  };

  return (
    <div>
      {viewModalData && (
        <Modal
          onSave={!isReadOnly ? handleSave : () => setViewModalData(null)}
          saveButtonText={!isReadOnly ? 'Save' : 'Close'}
          title={isReadOnly ? 'Template Details' : viewModalData.id ? 'Edit Template' : 'Create Template'}
          onClose={() => setViewModalData(null)}
        >
          <div className="mt-4 space-y-4 overflow-auto">
            <TextField
              label="Template Name"
              value={editData.templateName}
              onChange={e => handleChange('templateName', e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <TextField
              label="Application Name"
              value={editData.templateName}
              onChange={e => handleChange('templateName', e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <TextField
              label="Email Type"
              value={editData.emailType}
              onChange={e => handleChange('emailType', e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? 'cursor-not-allowed' : ''}
            />
            <TextField
              label="Subject"
              value={editData.subject}
              onChange={e => handleChange('subject', e.target.value)}
              readOnly={isReadOnly}
              cn={isReadOnly ? 'cursor-not-allowed' : ''}
            />

            <ReactQuill
              className={`h-[200px]`}
              value={editData.body}
              onChange={value => handleChange('body', value)}
              modules={quillModules}
              formats={quillFormats}
              theme="snow"
              readOnly={isReadOnly}
            />

            <div className="mt-20">
              {!isReadOnly && (
                <div className="mt-2 mb-4 flex flex-wrap gap-2 text-sm">
                  {sedationKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className={`rounded-full border px-2 py-1 ${
                        editData.body.toLowerCase().includes(keyword.toLowerCase())
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
        {templates.map(item => (
          <div
            key={item.id}
            className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="absolute top-4 right-4">
              <FiMoreVertical
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
              />
              {menuOpenId === item.id && (
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
