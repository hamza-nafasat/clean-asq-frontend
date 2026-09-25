import {
  useCreateFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useUpdateFormStrategyMutation,
} from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import StrategiesHeading from "./components/StrategiesHeading";
import StrategiesTable from "./components/StrategiesTable";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import { STRATEGIES_SCREEN_CONTEXT } from "./utils/strategies.constants";
import { buildStrategiesScreenState, buildStrategyAssistantActions } from "./utils/strategies.assistant.utils";
import { getAvailableFormOptions, toLookupOptions } from "./utils/strategies.utils";

const SERVER_URL = getEnv("SERVER_URL");

const Strategies = () => {
  const aiConfirm = useConfirm();
  const canReadForm = usePermission(PERMISSIONS.READ_FORM);
  const canReadLookup = usePermission(PERMISSIONS.READ_LOOKUP);
  // pickers need forms and lookups
  const canCreateStrategy = usePermission(PERMISSIONS.CREATE_STRATEGY) && canReadForm && canReadLookup;
  const canUpdateStrategy = usePermission(PERMISSIONS.UPDATE_STRATEGY) && canReadForm && canReadLookup;

  const [createFormStrategy] = useCreateFormStrategyMutation();
  const [updateFormStrategy] = useUpdateFormStrategyMutation();
  const { data: formData } = useGetMyAllFormsQuery(undefined, {
    skip: !canReadForm,
  });
  const { data: lookupData } = useGetAllSearchStrategiesQuery(undefined, {
    skip: !canReadLookup,
  });
  const { data: strategyData, isLoading, isError, refetch } = useGetAllFormStrategiesQuery();
  const formStrategies = strategyData?.data || [];
  const forms = canReadForm ? formData?.data : null;
  const lookupOptions = toLookupOptions(lookupData?.data);

  useScreenContext({
    ...STRATEGIES_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}/api/ai/strategy-chat`,
    currentState: buildStrategiesScreenState({
      formStrategies,
      lookups: lookupData?.data,
      forms: formData?.data,
    }),
    actions: buildStrategyAssistantActions({
      formStrategies,
      createFormStrategy,
      updateFormStrategy,
      askConfirm: aiConfirm.ask,
    }),
    deps: {
      strategyCount: formStrategies.length,
      lookupCount: lookupData?.data?.length,
      formCount: formData?.data?.length,
    },
  });

  return (
    <article className="mt-5">
      <StrategiesHeading
        canCreateStrategy={canCreateStrategy}
        formOptions={getAvailableFormOptions(formStrategies, forms)}
        lookupOptions={lookupOptions}
      />
      <StrategiesTable
        strategies={formStrategies}
        forms={forms}
        lookupOptions={lookupOptions}
        canUpdateStrategy={canUpdateStrategy}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />

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

export default Strategies;
