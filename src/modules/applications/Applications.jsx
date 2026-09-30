import { useState } from "react";
import {
  useDeleteSingleSubmitOrDraftFormMutation,
  useGenerateApplicationPdfMutation,
  useGetAllSubmitOrDraftFormsQuery,
  useGiveSpecialAccessToUserMutation,
} from "@/redux/apis/form.apis";
import { useGetAllRolesQuery } from "@/redux/apis/roleManagement.apis";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import useApplicationsForms from "./hooks/useApplicationsForms";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import ListFilter from "@/components/global/ListFilter";
import ApplicationsHeading from "./components/ApplicationsHeading";
import ApplicationsTable from "./components/ApplicationsTable";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import {
  APPLICATIONS_AI_CHAT_PATH,
  APPLICATIONS_SCREEN_CONTEXT,
  INITIAL_APPLICATION_FILTERS,
} from "./utils/applications.constants";
import {
  buildApplicationsAssistantActions,
  buildApplicationsScreenState,
  getSubmittedFormIds,
} from "./utils/applications.assistant.utils";
import { buildApplicationFilterFields, filterApplications, isSubmitted } from "./utils/applications.utils";

const SERVER_URL = getEnv("SERVER_URL");

const Applications = () => {
  const { data, isLoading, isError, refetch } = useGetAllSubmitOrDraftFormsQuery();
  const [deleteApplication] = useDeleteSingleSubmitOrDraftFormMutation();
  const [giveSpecialAccessToUser] = useGiveSpecialAccessToUserMutation();
  const [generateApplicationPdf] = useGenerateApplicationPdfMutation();
  const canShareApplication = usePermission(PERMISSIONS.SHARE_APPLICATION);
  const canReadRole = usePermission(PERMISSIONS.READ_ROLE);
  // every role for the role filter
  const { data: roles } = useGetAllRolesQuery(undefined, { skip: !canReadRole });
  const aiConfirm = useConfirm();
  const [filters, setFilters] = useState(INITIAL_APPLICATION_FILTERS);

  const applications = data?.data ?? [];
  const forms = useApplicationsForms(canShareApplication ? getSubmittedFormIds(applications) : []);
  const filteredApplications = filterApplications(applications, filters);
  const roleNames = (roles?.data ?? []).map((role) => role.name);
  const submittedCount = applications.filter(isSubmitted).length;
  const hasActiveFilters = Object.values(filters).some(Boolean);

  useScreenContext({
    ...APPLICATIONS_SCREEN_CONTEXT,
    aiEndpoint: `${SERVER_URL}${APPLICATIONS_AI_CHAT_PATH}`,
    currentState: buildApplicationsScreenState({ applications, forms }),
    actions: buildApplicationsAssistantActions({
      applications,
      forms,
      deleteApplication,
      giveSpecialAccessToUser,
      generateApplicationPdf,
      askConfirm: aiConfirm.ask,
    }),
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <article
      className="bg-backgroundColor w-full rounded-t-md p-4 md:p-6 lg:w-[calc(100vw-350px)]"
      data-testid="applications-page"
    >
      <ApplicationsHeading submittedCount={submittedCount} draftCount={applications.length - submittedCount} />
      <ListFilter
        fields={buildApplicationFilterFields(applications, roleNames)}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        className="mb-5"
        onChange={handleFilterChange}
        onClear={() => setFilters(INITIAL_APPLICATION_FILTERS)}
      />
      <ApplicationsTable
        applications={filteredApplications}
        hasApplications={applications.length > 0}
        forms={forms}
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

export default Applications;
