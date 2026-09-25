import { useState } from "react";
import {
  useCreateSearchStrategyMutation,
  useGetAllSearchStrategiesQuery,
  useUpdateSearchStrategyMutation,
} from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Tabs from "@/components/shared/Tabs";
import LookupManagementExtractionContext from "./components/LookupManagementExtractionContext";
import LookupManagementHeading from "./components/LookupManagementHeading";
import LookupManagementTable from "./components/LookupManagementTable";
import getEnv from "@/utils/env";
import { LOOKUP_SCREEN_CONTEXT, LOOKUP_TAB_LIST, LOOKUP_TABS } from "./utils/lookupManagement.constants";
import { buildLookupAssistantActions, buildLookupScreenState } from "./utils/lookupManagement.assistant.utils";

const SERVER_URL = getEnv("SERVER_URL");

const LookupManagement = () => {
  const [activeTab, setActiveTab] = useState(LOOKUP_TABS.LOOKUP_KEYS);
  const [addModal, setAddModal] = useState(null);
  const aiConfirm = useConfirm();
  const { data, isLoading, isError, refetch } = useGetAllSearchStrategiesQuery();
  const [createSearchStrategy] = useCreateSearchStrategyMutation();
  const [updateSearchStrategy] = useUpdateSearchStrategyMutation();
  const lookups = data?.data || [];

  // new key remounts the form
  const openAddModal = (draft = null) => setAddModal((prev) => ({ draft, key: (prev?.key ?? 0) + 1 }));

  useScreenContext({
    ...LOOKUP_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}/api/ai/lookup-chat`,
    currentState: buildLookupScreenState(lookups),
    actions: buildLookupAssistantActions({
      lookups,
      createSearchStrategy,
      updateSearchStrategy,
      onOpenCreateModal: openAddModal,
      askConfirm: aiConfirm.ask,
    }),
    deps: { lookupCount: lookups.length },
  });

  return (
    <article className="mt-5">
      <LookupManagementHeading addModal={addModal} onOpenAdd={openAddModal} onCloseAdd={() => setAddModal(null)} />
      <Tabs variant="pill" tabs={LOOKUP_TAB_LIST} activeTab={activeTab} onTabChange={setActiveTab} />
      <section className="mt-5">
        {activeTab === LOOKUP_TABS.LOOKUP_KEYS ? (
          <LookupManagementTable lookups={lookups} isLoading={isLoading} isError={isError} onRetry={refetch} />
        ) : (
          <LookupManagementExtractionContext />
        )}
      </section>

      <ConfirmationModal
        isOpen={aiConfirm.isOpen}
        title={aiConfirm.pending?.title}
        message={aiConfirm.pending?.message}
        confirmButtonText={aiConfirm.pending?.confirmButtonText}
        onConfirm={aiConfirm.resolveAsked}
        onClose={aiConfirm.close}
      />
    </article>
  );
};

export default LookupManagement;
