import {
  useCreateFormStrategyMutation,
  useDeleteFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useGetAllSearchStrategiesQuery,
  useGetMyAllFormsQuery,
  useUpdateFormStrategyMutation,
} from "@/redux/apis/form.apis";
import useConfirm from "@/hooks/useConfirm";
import useListFilter from "@/hooks/useListFilter";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import ListFilter from "@/components/global/ListFilter";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import StrategiesHeading from "./components/StrategiesHeading";
import StrategiesTable from "./components/StrategiesTable";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import {
  INITIAL_STRATEGY_FILTERS,
  STRATEGIES_SCREEN_CONTEXT,
  STRATEGY_FILTER_KEYS,
  STRATEGY_FILTER_FIELDS,
} from "./utils/strategies.constants";
import { buildStrategiesScreenState, buildStrategyAssistantActions } from "./utils/strategies.assistant.utils";
import {
  filterStrategies,
  getAvailableFormOptions,
  getStrategyFilterFormOptions,
  toLookupOptions,
} from "./utils/strategies.utils";

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
  const [deleteFormStrategy] = useDeleteFormStrategyMutation();
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
  const { filters, handleChange, clearFilters, hasActiveFilters } = useListFilter(INITIAL_STRATEGY_FILTERS);
  const filteredStrategies = filterStrategies(formStrategies, filters);
  const filterFields = STRATEGY_FILTER_FIELDS.map((field) =>
    field.name === STRATEGY_FILTER_KEYS.FORM
      ? { ...field, options: getStrategyFilterFormOptions(formStrategies) }
      : field,
  );

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
      deleteFormStrategy,
      askConfirm: aiConfirm.ask,
    }),
  });

  return (
    <article className="mt-5">
      <StrategiesHeading
        canCreateStrategy={canCreateStrategy}
        formOptions={getAvailableFormOptions(formStrategies, forms)}
        lookupOptions={lookupOptions}
      />
      {!isLoading && !isError && formStrategies.length > 0 && (
        <ListFilter
          className="mb-5"
          fields={filterFields}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onChange={handleChange}
          onClear={clearFilters}
        />
      )}
      <StrategiesTable
        strategies={formStrategies}
        visibleStrategies={filteredStrategies}
        hasActiveFilters={hasActiveFilters}
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
