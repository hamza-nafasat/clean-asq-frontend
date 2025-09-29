import ApplyBranding from '@/components/admin/brandings/globalBranding/ApplyBranding';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { ThreeDotEditViewDelete } from '@/components/shared/ThreeDotViewEditDelete';
// import { Button } from '@/components/ui/button';
import { getTableStyles } from '@/data/data';
import { useBranding } from '@/hooks/BrandingContext';
import { useGetMyProfileFirstTimeMutation } from '@/redux/apis/authApis';
import {
  useAddBrandingInFormMutation,
  useDeleteSingleBrandingMutation,
  useGetAllBrandingsQuery,
} from '@/redux/apis/brandingApis';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Brandings = () => {
  const navigate = useNavigate();
  const actionMenuRefs = useRef(new Map());
  const [isLoading] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const [onHome, setOnHome] = React.useState(false);
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const [selectedBranding, setSelectedBranding] = useState(null);

  const { data: brandings = [], isLoading: isBrandingsLoading, refetch } = useGetAllBrandingsQuery();
  const [deleteBranding, { isLoading: isDeleting }] = useDeleteSingleBrandingMutation();
  const [addFromBranding] = useAddBrandingInFormMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const {
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
  } = useBranding();

  const ButtonsForThreeDot = [
    {
      name: 'edit',
      icon: <Pencil size={16} className="mr-2" />,
      onClick: row => {
        navigate(`/branding/single/${row?._id}`);
        setActionMenu(null);
      },
    },
    {
      name: 'delete',
      icon: <Trash size={16} className="mr-2" />,
      disabled: isDeleting,
      onClick: async row => {
        try {
          if (!row?._id) toast.error('Branding ID is missing');
          const res = await deleteBranding(row?._id).unwrap();
          if (res.success) {
            await refetch();
            toast.success(row?.message || 'Branding deleted successfully');
          }
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to delete branding');
        } finally {
          setActionMenu(null);
        }
      },
    },
    {
      name: 'apply',
      icon: <FaExchangeAlt size={16} className="mr-2" />,
      onClick: row => {
        setApplyModal(true);
        setSelectedBranding(row?._id);
        setActionMenu(null);
      },
    },
  ];

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
        if (onHome) {
          const res = await getUserProfile().unwrap();

          if (res?.data?.branding?.colors) {
            const userBranding = res?.data?.branding;
            if (userBranding?.colors) {
              setPrimaryColor(userBranding.colors.primary);
              setSecondaryColor(userBranding.colors.secondary);
              setAccentColor(userBranding.colors.accent);
              setTextColor(userBranding.colors.text);
              setLinkColor(userBranding.colors.link);
              setBackgroundColor(userBranding.colors.background);
              setFrameColor(userBranding.colors.frame);
              setFontFamily(userBranding.fontFamily);
              setLogo(userBranding?.selectedLogo);
            }
          }
        }
        toast?.success(res?.message || 'Branding applied successfully');
      }
    } catch (error) {
      console.error('Error applying branding:', error);
      toast.error(error?.data?.message || 'Failed to apply branding');
    } finally {
      setApplyModal(false);
      setSelectedId(null);
      setOnHome(false);
    }
  };

  const columns = () => [
    {
      name: 'Name',
      selector: row => row?.name,
      sortable: true,
    },
    {
      name: 'Url',
      selector: row => row?.url || 'N/A',
      sortable: true,
    },
    {
      name: 'logos',
      selector: row => row?.logos?.length || 0,
      sortable: true,
    },
    {
      name: 'Font family',
      selector: row => row?.fontFamily || 'N/A',
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => {
        if (!actionMenuRefs.current.has(row?._id)) {
          actionMenuRefs.current.set(row?._id, React.createRef());
        }
        const rowRef = actionMenuRefs.current.get(row?._id);
        return (
          <div className="relative" ref={rowRef}>
            <button
              onClick={() => setActionMenu(prevActionMenu => (prevActionMenu === row?._id ? null : row?._id))}
              className="cursor-pointer rounded p-1 hover:bg-gray-100"
              aria-label="Actions"
            >
              <MoreVertical size={18} />
            </button>
            {actionMenu === row?._id && <ThreeDotEditViewDelete buttons={ButtonsForThreeDot} row={row} />}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const handleClickOutside = event => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        ref => !ref.current?.contains(event.target)
      );
      if (clickedOutsideAllMenus) setActionMenu(null);
    };
    if (actionMenu !== null) document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenu]);

  return isBrandingsLoading ? (
    <CustomLoading />
  ) : (
    <div className="mt-5 w-full">
      {applyModal && (
        <ConfirmationModal
          isOpen={!!applyModal}
          message={
            <ApplyBranding
              setSelectedId={setSelectedId}
              selectedId={selectedId}
              onConfirm={onConfirmApply}
              setOnHome={setOnHome}
              onHome={onHome}
            />
          }
          confirmButtonText="Apply Branding"
          confirmButtonClassName=" border-none hover:bg-red-600 text-white"
          cancelButtonText="cancel"
          onConfirm={onConfirmApply}
          onClose={() => setApplyModal(false)}
          title={'Apply Branding'}
        />
      )}
      <div className="mb-4 flex justify-end px-4">
        <Button label={'Create Branding'} onClick={() => navigate('/branding/create')} />
        {/* Create Branding
        </Button> */}
      </div>
      <div className="mt-5 w-full lg:w-[670px] xl:w-full">
        <div className="min-w-[500px]">
          <DataTable
            data={brandings?.data || []}
            columns={columns()}
            customStyles={tableStyles}
            pagination
            highlightOnHover
            progressPending={isLoading}
            noDataComponent="No Brandings Found"
            className="!rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default Brandings;
