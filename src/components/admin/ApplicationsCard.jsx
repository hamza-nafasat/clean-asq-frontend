import { useAddBrandingInFormMutation, useGetAllBrandingsQuery } from '@/redux/apis/brandingApis';
import { useCreateFormMutation, useDeleteSingleFormMutation, useGetMyAllFormsQuery } from '@/redux/apis/formApis';
import { MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { FaCheck } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FileUploader from '../applicationVerification/Documents/FileUploader';
import ConfirmationModal from '../shared/ConfirmationModal';
import Button from '../shared/small/Button';
import Modal from '../shared/small/Modal';
import TextField from '../shared/small/TextField';
import ApplyBranding from './brandings/globalBranding/ApplyBranding';
import { LocationModalComponent } from './varification/LocationStatusModal';
import { useBranding } from '@/hooks/BrandingContext';

export default function ApplicationsCard() {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [clientQuery, setClientQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchMode, setSearchMode] = useState('client');
  const [creteFormModal, setCreateFormModal] = useState(false);
  const [file, setFile] = useState(null);
  const [createForm, { isLoading }] = useCreateFormMutation();
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedBranding, setSelectedBranding] = useState(null);
  const [onHome, setOnHome] = useState(false);
  const { data: forms, refetch } = useGetMyAllFormsQuery();
  const { data: brandings } = useGetAllBrandingsQuery();
  const [addFromBranding] = useAddBrandingInFormMutation();
  const [locationModal, setLocationModal] = useState(false);
  const { logo } = useBranding();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [formLocationData, setFormLocationData] = useState({
    title: '',
    subtitle: '',
    message: '',
    status: '',
    formatedText: '',
    formatingTextInstructions: '',
  });
  const [deleteForm] = useDeleteSingleFormMutation();

  const createFormWithCsvHandler = async () => {
    console.log('file', file);
    if (!file) return toast.error('Please select a file');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await createForm(formData).unwrap();
      if (res.success) toast.success(res.message);
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error(error?.data?.message || 'Failed to create form');
    } finally {
      setCreateFormModal(false);
    }
  };

  const onConfirmApply = async () => {
    if (!selectedBranding) toast.error('Branding ID is missing');
    if (!selectedId && !onHome) toast.error('Form ID is required if onHome is not provided');
    try {
      const res = await addFromBranding({
        brandingId: selectedBranding,
        formId: selectedId,
        onHome: onHome ? 'yes' : 'no',
      }).unwrap();
      console.log('res', res);
      if (res?.success) {
        await refetch();
        toast?.success(res?.message || 'Branding applied successfully');
      }
    } catch (error) {
      console.error('Error applying branding:', error);
      toast.error(error?.data?.message || 'Failed to apply branding');
    } finally {
      setOpenModal(false);
      setSelectedId(null);
      setSelectedBranding(null);
      setOnHome(false);
      setActionMenu(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleDeleteForm = async () => {
    try {
      if (!deleteConfirmation) return;
      const res = await deleteForm({ _id: deleteConfirmation }).unwrap();
      if (res?.success) {
        await refetch();
        toast?.success(res?.message || 'Form deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error(error?.data?.message || 'Failed to delete form');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="rounded-md bg-white p-5 shadow">
      {/* modal for delete form */}
      <ConfirmationModal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleDeleteForm}
        title="Delete Form"
        message={`Are you sure you want to delete tihs form?`}
        confirmButtonText="Delete"
        confirmButtonClassName="bg-red-500 text-white"
      />
      {/* modal for set branding  */}

      {openModal && (
        <ConfirmationModal
          isOpen={!!openModal}
          message={
            <ApplyBranding
              brandings={brandings?.data}
              setSelectedId={setSelectedBranding}
              selectedId={selectedBranding}
              setOnHome={setOnHome}
              onHome={onHome}
            />
          }
          confirmButtonText="Apply Branding"
          confirmButtonClassName="border-none hover:bg-red-600 text-white"
          cancelButtonText="cancel"
          onConfirm={onConfirmApply}
          onClose={() => setOpenModal(false)}
          title={'Apply Branding'}
        />
      )}
      {locationModal && (
        <Modal onClose={() => setLocationModal(false)} title="Set Location">
          <LocationModalComponent
            locationModal={locationModal}
            setLocationModal={setLocationModal}
            refetch={refetch}
            formLocationData={formLocationData}
          />
        </Modal>
      )}
      {/* Header Section */}
      {creteFormModal && (
        <Modal onClose={() => setCreateFormModal(false)} title="">
          <FileUploader
            label="Upload Image / PDF / CSV"
            accept=".pdf,image/*,.csv"
            onFileSelect={file => setFile(file)}
          />
          <div className="my-2 flex items-center justify-end">
            <Button
              className={`${(!file || isLoading) && 'pointer-events-none cursor-not-allowed opacity-50'}`}
              label={'Create '}
              onClick={createFormWithCsvHandler}
            />
          </div>
        </Modal>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-textPrimary text-base font-medium md:text-2xl">
            Financial Services Application Platform
          </h1>
          <p className="text-textPrimary mt-5 text-base font-normal md:text-lg">
            Dynamic application forms with AI-assisted completion and automated data lookup
          </p>
        </div>
        <div className="mt-10 flex gap-6 md:mt-0">
          {/* <Button label={'Help'} variant="secondary" /> */}
          <Button
            label={'Create Form'}
            onClick={() => {
              setCreateFormModal(true);
              setFile(null);
            }}
            className="truncate !text-sm md:!text-base"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 grid w-full grid-cols-1 items-end gap-[8px] xl:grid-cols-2">
        {/* Search Input with Toggle */}

        <div className="w-full rounded-[4px]">
          <TextField
            label={'Advance search'}
            type="text"
            className="border-none bg-white text-sm outline-none"
            placeholder={searchMode === 'client' ? 'Search From' : 'Search Name'}
            value={searchMode === 'client' ? clientQuery : nameQuery}
            onChange={e => (searchMode === 'client' ? setClientQuery(e.target.value) : setNameQuery(e.target.value))}
            leftIcon={<CiSearch />}
            rightIcon={
              <div className="flex gap-x-2">
                <Button
                  className={`!border-none ${searchMode === 'client' ? '!bg-primary !text-white' : '!bg-gray-200 !text-gray-600'}`}
                  onClick={() => setSearchMode('client')}
                  label={'BY CLIENT#'}
                />

                <Button
                  className={`!border-none ${searchMode === 'name' ? '!bg-primary !text-white' : '!bg-gray-200 !text-gray-600'}`}
                  onClick={() => setSearchMode('name')}
                  label={'BY NAME#'}
                />
              </div>
            }
          />
        </div>
        {/* Date Pickers */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="col-span-6 md:col-span-5 xl:col-span-5">
            <TextField label={'From'} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-4">
            <TextField label={'To'} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          {/* Search Button */}
          <div className="col-span-6 flex items-end justify-end md:col-span-3 xl:col-span-3">
            <Button icon={CiSearch} label={'Search'} className="mt-0 !h-12.5 md:mt-8 md:!w-full" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="p- sm:p- md:p- grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {forms?.data?.map((form, index) => {
          const colors = form?.branding?.colors;

          return (
            <div
              key={index}
              className="relative flex min-w-0 flex-col rounded-[8px] border bg-white p-3 shadow-md transition duration-300 hover:shadow-md sm:p-4 md:p-6"
            >
              <img
                src={form?.branding?.selectedLogo || logo}
                width={50}
                height={50}
                alt="logo"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center justify-end">
                <div className="relative">
                  <button
                    ref={menuButtonRef}
                    onClick={actionMenu === form?._id ? () => setActionMenu(null) : () => setActionMenu(form?._id)}
                    className="cursor-pointer rounded p-1 hover:bg-gray-100"
                    aria-label="Actions"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {actionMenu === form?._id && (
                    <div ref={buttonRef} className="absolute right-0 mt-2 w-40 rounded border bg-white shadow-lg">
                      <button
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          setSelectedId(form?._id);
                          setOpenModal(true);
                        }}
                      >
                        Set Branding
                      </button>
                      <button
                        onClick={() => {
                          setLocationModal(actionMenu);
                          setFormLocationData({
                            title: form?.locationTitle,
                            subtitle: form?.locationSubtitle,
                            status: form?.locationStatus,
                            message: form?.locationMessage,
                            formatedText: form?.formatedLocationMessage,
                            formatingTextInstructions: form?.formateTextInstructions,
                          });
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        Set Location
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(form?._id)}
                        className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                      >
                        Delete Form
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Menu icon */}
              <div className="absolute top-3 right-3 cursor-pointer sm:top-4 sm:right-4">{/* <CiMenuKebab /> */}</div>
              <div className="flex items-start gap-2 md:gap-4">
                {/* <CardIcon /> */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base leading-tight font-bold break-words text-gray-700 sm:text-lg md:text-2xl">
                      {form?.name}
                    </h2>
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-500 sm:text-sm">Created from CSV import</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-700 md:mt-3 md:text-base">
                <div className="flex items-center gap-1 md:gap-2">
                  <FaCheck className="text-primary" />
                  <span>{form?.sections?.length} form sections</span>
                </div>{' '}
                <div className="flex items-center gap-1 md:gap-2">
                  <FaCheck className="text-primary" />
                  <span>AI-assisted completion available</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-gray-500">Applicants: {form?.sections?.length}</span>
                <span className="text-gray-500">
                  Created:{' '}
                  {new Date(form?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="mt-3 flex w-full flex-col items-start justify-between gap-3 md:mt-6 md:flex-row md:gap-4">
                <Button
                  label="Start Application"
                  onClick={() => navigate(`/application-form/${form?._id}`)}
                  style={{
                    backgroundColor: colors?.primary,
                    borderColor: colors?.primary,
                    color: colors?.buttonTextPrimary,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
