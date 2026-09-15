import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, Trash } from "lucide-react";
import { FaExchangeAlt } from "react-icons/fa";
import useBranding from "@/hooks/useBranding";
import { useScreenContext } from "@/hooks/useScreenContext";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import {
  useAddBrandingInFormMutation,
  useDeleteSingleBrandingMutation,
  useGetAllBrandingsQuery,
} from "@/redux/apis/branding.apis";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import ApplyBranding from "@/components/global/ApplyBranding";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import BrandingTable from "./components/BrandingTable";
import {
  BRANDING_LIST_SCREEN_CONTEXT,
  BRANDING_ROUTES,
  BRANDING_ROW_ACTIONS,
} from "./utils/branding.constants";
import { executeBrandingAssignment, getBrandingSettersFromHook } from "@/utils/executeBrandingAssignment";
import getEnv from "@/utils/env";
import { getTableStyles } from "@/utils/tableStyles";

const Brandings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const branding = useBranding();
  const [applyModal, setApplyModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [onHome, setOnHome] = useState(false);
  const [selectedBranding, setSelectedBranding] = useState(null);

  const { data: allFormsData, refetch: formRefetch } = useGetMyAllFormsQuery();
  const { data: brandings = [], isLoading: isBrandingsLoading, refetch } = useGetAllBrandingsQuery();
  const [deleteBranding, { isLoading: isDeleting }] = useDeleteSingleBrandingMutation();
  const [addFromBranding] = useAddBrandingInFormMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();

  const { primaryColor, textColor, backgroundColor, secondaryColor } = branding;
  const tableStyles = getTableStyles({ primaryColor, secondaryColor, textColor, backgroundColor });

  const openBranding = (brandingId) => navigate(`${BRANDING_ROUTES.SINGLE}/${brandingId}`);

  const removeBranding = async (brandingId) => {
    const res = await deleteBranding(brandingId).unwrap();
    if (!res?.success) throw new Error(res?.message);
    return res;
  };

  const rowButtons = [
    {
      name: BRANDING_ROW_ACTIONS.EDIT,
      icon: <Pencil size={16} className="mr-2" />,
      onClick: (row) => openBranding(row?._id),
    },
    {
      name: BRANDING_ROW_ACTIONS.DELETE,
      icon: <Trash size={16} className="mr-2" />,
      disabled: isDeleting,
      onClick: async (row) => {
        try {
          if (!row?._id) toast.error("Branding ID is missing");
          await removeBranding(row?._id);
          await refetch();
          toast.success(row?.message || "Branding deleted successfully");
        } catch (error) {
          console.error("Delete branding error:", error);
          toast.error(error?.data?.message || "Failed to delete branding");
        }
      },
    },
    {
      name: BRANDING_ROW_ACTIONS.APPLY,
      icon: <FaExchangeAlt size={16} className="mr-2" />,
      onClick: (row) => {
        setApplyModal(true);
        setSelectedBranding(row?._id);
      },
    },
  ];

  const dispatchUserRefresh = async (profileRes) => {
    if (profileRes?.success) dispatch(userExist(profileRes.data));
    else dispatch(userNotExist());
  };

  const closeApplyModal = () => {
    setApplyModal(false);
    setSelectedId(null);
    setSelectedBranding(null);
    setOnHome(false);
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
        brandingSetters: getBrandingSettersFromHook(branding),
        dispatchUserRefresh,
        assignment: { brandingId: selectedBranding, formId: selectedId || undefined, applyToHome: onHome },
      });
      await formRefetch();
      toast?.success(res?.message || "Branding applied successfully");
    } catch (error) {
      console.error("Apply branding error:", error);
      toast.error(error?.message || error?.data?.message || "Failed to apply branding");
    } finally {
      closeApplyModal();
    }
  };

  useScreenContext({
    screenId: BRANDING_LIST_SCREEN_CONTEXT.SCREEN_ID,
    screenName: BRANDING_LIST_SCREEN_CONTEXT.SCREEN_NAME,
    assistantName: BRANDING_LIST_SCREEN_CONTEXT.ASSISTANT_NAME,
    aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/branding-list-chat`,
    greeting: BRANDING_LIST_SCREEN_CONTEXT.GREETING,
    currentState: {
      forms: (allFormsData?.data || []).map((f) => ({ _id: f._id, name: f.name || f.headerText || "Untitled" })),
      brandings: (brandings?.data || []).map((b) => ({
        _id: b._id,
        name: b.name,
        url: b.url || "",
        fontFamily: b.fontFamily || "",
        logoCount: b.logos?.length || 0,
        colors: {
          primary: b.colors?.primary || "",
          secondary: b.colors?.secondary || "",
          accent: b.colors?.accent || "",
          text: b.colors?.text || "",
          background: b.colors?.background || "",
        },
      })),
    },
    actions: {
      deleteBrandings: async ({ brandingIds }) => {
        const errors = [];
        for (const brandingId of brandingIds) {
          try {
            await removeBranding(brandingId);
          } catch {
            errors.push(brandingId);
          }
        }
        await refetch();
        if (errors.length) {
          toast.error(`Failed to delete ${errors.length} of ${brandingIds.length} brandings`);
          throw new Error(`Failed to delete ${errors.length} brandings`);
        }
      },
      openEditBranding: ({ brandingId }) => openBranding(brandingId),
      openCreateBranding: () => navigate(BRANDING_ROUTES.CREATE),
    },
    deps: [brandings?.data?.length, allFormsData?.data?.length],
  });

  if (isBrandingsLoading) return <CustomLoading />;

  return (
    <article className="mt-5 w-full" data-testid="branding-page">
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
      <header className="mb-4 flex justify-end">
        <Button
          label={"Create Branding"}
          onClick={() => navigate(BRANDING_ROUTES.CREATE)}
          data-testid="branding-create-btn"
        />
      </header>
      <section className="mt-5 w-full h-full overflow-y-auto lg:w-[calc(100vw-350px)]! xl:w-full">
        <BrandingTable
          brandings={brandings?.data || []}
          rowButtons={rowButtons}
          tableStyles={tableStyles}
          isLoading={isBrandingsLoading}
        />
      </section>
    </article>
  );
};

export default Brandings;
