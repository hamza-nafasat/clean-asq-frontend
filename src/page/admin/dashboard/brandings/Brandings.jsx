import ApplyBranding from "@/components/admin/brandings/globalBranding/ApplyBranding";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import Button from "@/components/shared/small/Button";
import CustomLoading from "@/components/shared/small/CustomLoading";
import { ThreeDotEditViewDelete } from "@/components/shared/ThreeDotViewEditDelete";
// import { Button } from '@/components/ui/button';
import { getTableStyles } from "@/data/data";
import { useBranding } from "@/hooks/BrandingContext";
import { useScreenContext } from "@/hooks/useScreenContext";
import getEnv from "@/lib/env";
import {
  executeBrandingAssignment,
  executeBrandingAssignments,
  getBrandingSettersFromHook,
  mapHomeBranding,
} from "@/lib/executeBrandingAssignment";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/authApis";
import {
  useAddBrandingInFormMutation,
  useDeleteSingleBrandingMutation,
  useGetAllBrandingsQuery,
} from "@/redux/apis/brandingApis";
import { useGetMyAllFormsQuery } from "@/redux/apis/formApis";
import { userExist, userNotExist } from "@/redux/slices/authSlice";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { FaExchangeAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Brandings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const actionMenuRefs = useRef(new Map());
  const [applyModal, setApplyModal] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { primaryColor, textColor, backgroundColor, secondaryColor } = useBranding();
  const [onHome, setOnHome] = React.useState(false);
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });
  const [selectedBranding, setSelectedBranding] = useState(null);

  const { data: allFormsData, refetch: formRefetch } = useGetMyAllFormsQuery();
  const user = useSelector((state) => state.auth.user);

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
    setButtonTextPrimary,
    setButtonTextSecondary,
    setHeaderAlignment,
    setHeaderBackground,
    setFooterBackground,
    setHeaderText,
    setFooterText,
    setHighlightingColor,
    setApplicationFooterText,
    setAppLogoMaxHeight,
    setAppLogoMaxWidth,
    setAiVoice,
    setAiCustomPrompt,
    setAiLaunchButtonColor,
    setAiHeaderColor,
    setAiBannerColor,
    setAiBannerTextColor,
    setAiSliderColor,
    setPrivacyPolicyUrl,
    setTermsOfServiceUrl,
    setFavicon,
    setTabTitle,
    setHeaderEffect,
    setFooterEffect,
    setEmailHeaderEffect,
    setEmailFooterEffect,
    setButtonEffect,
    setHeaderMaterial,
    setFooterMaterial,
    setButtonMaterial,
    setEmailHeaderMaterial,
    setEmailFooterMaterial,
  } = useBranding();

  const ButtonsForThreeDot = [
    {
      name: "edit",
      icon: <Pencil size={16} className="mr-2" />,
      onClick: (row) => {
        navigate(`/branding/single/${row?._id}`);
        setActionMenu(null);
      },
    },
    {
      name: "delete",
      icon: <Trash size={16} className="mr-2" />,
      disabled: isDeleting,
      onClick: async (row) => {
        try {
          if (!row?._id) toast.error("Branding ID is missing");
          const res = await deleteBranding(row?._id).unwrap();
          if (res.success) {
            await refetch();
            toast.success(row?.message || "Branding deleted successfully");
          }
        } catch (error) {
          toast.error(error?.data?.message || "Failed to delete branding");
        } finally {
          setActionMenu(null);
        }
      },
    },
    {
      name: "apply",
      icon: <FaExchangeAlt size={16} className="mr-2" />,
      onClick: (row) => {
        setApplyModal(true);
        setSelectedBranding(row?._id);
        setActionMenu(null);
      },
    },
  ];

  const brandingSetters = getBrandingSettersFromHook({
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextPrimary,
    setButtonTextSecondary,
    setHeaderAlignment,
    setHeaderBackground,
    setFooterBackground,
    setHeaderText,
    setFooterText,
    setHighlightingColor,
    setApplicationFooterText,
    setAppLogoMaxWidth,
    setAppLogoMaxHeight,
    setAiVoice,
    setAiCustomPrompt,
    setAiLaunchButtonColor,
    setAiHeaderColor,
    setAiBannerColor,
    setAiBannerTextColor,
    setAiSliderColor,
    setPrivacyPolicyUrl,
    setTermsOfServiceUrl,
    setFavicon,
    setTabTitle,
    setHeaderEffect,
    setFooterEffect,
    setEmailHeaderEffect,
    setEmailFooterEffect,
    setButtonEffect,
    setHeaderMaterial,
    setFooterMaterial,
    setButtonMaterial,
    setEmailHeaderMaterial,
    setEmailFooterMaterial,
  });

  const dispatchUserRefresh = async (profileRes) => {
    if (profileRes?.success) {
      dispatch(userExist(profileRes.data));
    } else {
      dispatch(userNotExist());
    }
  };

  const onConfirmApply = async () => {
    if (!selectedBranding) {
      toast.error("Branding ID is missing");
      return;
    }
    if (!selectedId && !onHome) {
      toast.error("Form ID is required if onHome is not provided");
      return;
    }
    try {
      const res = await executeBrandingAssignment({
        addBrandingMutation: addFromBranding,
        getUserProfile,
        brandingSetters,
        dispatchUserRefresh,
        assignment: {
          brandingId: selectedBranding,
          formId: selectedId || undefined,
          applyToHome: onHome,
        },
      });
      await formRefetch();
      toast?.success(res?.message || "Branding applied successfully");
    } catch (error) {
      console.error("Error applying branding:", error);
      toast.error(error?.message || error?.data?.message || "Failed to apply branding");
    } finally {
      setApplyModal(false);
      setSelectedId(null);
      setSelectedBranding(null);
      setOnHome(false);
    }
  };

  const columns = () => [
    {
      name: "Name",
      selector: (row) => row?.name,
      sortable: true,
    },
    {
      name: "Url",
      selector: (row) => row?.url || "N/A",
      sortable: true,
    },
    {
      name: "logos",
      selector: (row) => row?.logos?.length || 0,
      sortable: true,
    },
    {
      name: "Font family",
      selector: (row) => row?.fontFamily || "N/A",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => {
        if (!actionMenuRefs.current.has(row?._id)) {
          actionMenuRefs.current.set(row?._id, React.createRef());
        }
        const rowRef = actionMenuRefs.current.get(row?._id);
        return (
          <div className="relative" ref={rowRef}>
            <button
              onClick={() => setActionMenu((prevActionMenu) => (prevActionMenu === row?._id ? null : row?._id))}
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
    const handleClickOutside = (event) => {
      const clickedOutsideAllMenus = Array.from(actionMenuRefs.current.values()).every(
        (ref) => !ref.current?.contains(event.target),
      );
      if (clickedOutsideAllMenus) setActionMenu(null);
    };
    if (actionMenu !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenu]);

  const brandingListForAi = (brandings?.data || []).map((b) => ({
    _id: b._id,
    name: b.name,
    url: b.url || "",
    fontFamily: b.fontFamily || "",
    logoCount: b.logos?.length || 0,
    colors: b.colors || null,
  }));

  const availableForms = (allFormsData?.data || []).map((f) => ({
    _id: f._id,
    name: f.name,
    branding: f.branding ? { _id: f.branding._id, name: f.branding.name } : null,
  }));

  const homeBranding = mapHomeBranding(user);

  useScreenContext({
    screenId: "branding-list",
    screenName: "Branding Management",
    assistantName: "Branding List Assistant",
    aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/branding-list-chat`,
    greeting:
      "Hi! I'm your **Branding List Assistant**.\n\nI can help you:\n- **Find and describe** branding profiles\n- **Apply branding** to forms and/or the home/website\n- **Open the create page** for a new branding\n- **Open any profile** for editing\n- **Delete** profiles (with confirmation)\n\nWhat would you like to do?",
    description: "The Branding Management screen lists all branding profiles in the system.",
    currentState: {
      brandings: brandingListForAi,
      availableBrandings: brandingListForAi,
      availableForms,
      homeBranding,
    },
    actions: {
      openCreateBranding: () => navigate("/branding/create"),
      openEditBranding: ({ brandingId }) => navigate(`/branding/single/${brandingId}`),
      deleteBrandings: async ({ brandingIds }) => {
        for (const id of brandingIds) {
          await deleteBranding(id).unwrap();
        }
        await refetch();
      },
      setFormsBranding: async ({ updates }) => {
        const { message } = await executeBrandingAssignments({
          updates,
          addBrandingMutation: addFromBranding,
          getUserProfile,
          brandingSetters,
          dispatchUserRefresh,
        });
        await Promise.all([refetch(), formRefetch()]);
        toast.success(message || "Branding applied successfully");
      },
      openApplyBrandingModal: ({ brandingId, formId, applyToHome } = {}) => {
        if (brandingId) setSelectedBranding(brandingId);
        if (formId) setSelectedId(formId);
        if (applyToHome !== undefined) setOnHome(!!applyToHome);
        setApplyModal(true);
      },
    },
    deps: {
      count: brandingListForAi.length,
      ids: brandingListForAi.map((b) => b._id).join(","),
      formsCount: availableForms.length,
      homeBrandingId: homeBranding?._id,
    },
  });

  if (isBrandingsLoading) return <CustomLoading />;

  return (
    <div className="mt-5 w-full" data-testid="branding-page">
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
          title={"Apply Branding"}
        />
      )}
      <div className="mb-4 flex justify-end">
        <Button
          label={"Create Branding"}
          onClick={() => navigate("/branding/create")}
          data-testid="branding-create-btn"
        />
        {/* Create Branding
        </Button> */}
      </div>
      <div className="mt-5 w-full h-full overflow-y-auto lg:w-[calc(100vw-350px)]! xl:w-full">
        {/* <div className="min-w-[500px]"> */}
        <DataTable
          data={brandings?.data || []}
          columns={columns()}
          customStyles={tableStyles}
          progressPending={isBrandingsLoading}
          noDataComponent="No Brandings Found"
          className="rounded-md!"
          highlightOnHover
          fixedHeader
          persistTableHead
          responsive
          pagination
        />
        {/* </div> */}
      </div>
    </div>
  );
};

export default Brandings;
