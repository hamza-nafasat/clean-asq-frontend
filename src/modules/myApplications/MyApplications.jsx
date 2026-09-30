import { useSelector } from "react-redux";
import {
  useApplicantGiveSpecialAccessToBeneficialOwnerMutation,
  useGeneratePdfFormMutation,
  useGetMyApplicationsQuery,
  useRemoveSavedFormMutation,
} from "@/redux/apis/form.apis";
import { FiAlertCircle, FiLock } from "react-icons/fi";
import useConfirm from "@/hooks/useConfirm";
import usePermission from "@/hooks/usePermission";
import { useScreenContext } from "@/hooks/useScreenContext";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import MyApplicationsHeading from "./components/MyApplicationsHeading";
import MyApplicationsList from "./components/MyApplicationsList";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";
import { MY_APPLICATIONS_AI_CHAT_PATH, MY_APPLICATIONS_SCREEN_CONTEXT } from "./utils/myApplications.constants";
import {
  buildMyApplicationsAssistantActions,
  buildMyApplicationsScreenState,
} from "./utils/myApplications.assistant.utils";

const SERVER_URL = getEnv("SERVER_URL");

const MyApplications = () => {
  const aiConfirm = useConfirm();
  const userId = useSelector((state) => state.auth.user?._id);
  const canSubmitForm = usePermission(PERMISSIONS.SUBMIT_FORM);
  const { data, isLoading, isError, refetch } = useGetMyApplicationsQuery(undefined, {
    skip: !canSubmitForm,
    // form changes elsewhere show on every visit
    refetchOnMountOrArgChange: true,
  });
  const [removeSavedForm] = useRemoveSavedFormMutation();
  const [inviteBeneficialOwner] = useApplicantGiveSpecialAccessToBeneficialOwnerMutation();
  const [generatePdfForm] = useGeneratePdfFormMutation();
  const drafts = data?.data?.saved || [];
  const submissions = data?.data?.submitted || [];
  const invitations = data?.data?.pendingOwnerForms || [];

  useScreenContext({
    ...MY_APPLICATIONS_SCREEN_CONTEXT,
    enabled: canSubmitForm,
    aiEndpoint: `${SERVER_URL}${MY_APPLICATIONS_AI_CHAT_PATH}`,
    currentState: buildMyApplicationsScreenState({ drafts, submissions, invitations }),
    actions: buildMyApplicationsAssistantActions({
      drafts,
      submissions,
      userId,
      removeSavedForm,
      inviteBeneficialOwner,
      generatePdfForm,
      askConfirm: aiConfirm.ask,
    }),
  });

  if (!canSubmitForm)
    return (
      <EmptyState
        variant="panel"
        icon={<FiLock size={28} />}
        title="You don't have permission to submit applications"
      />
    );
  if (isLoading) return <LoadingState title="Loading your applications" />;
  if (isError)
    return (
      <EmptyState variant="panel" icon={<FiAlertCircle size={28} />} title="Could not load your applications">
        <Button type="button" label="Try again" onClick={refetch} />
      </EmptyState>
    );

  return (
    <article data-testid="my-applications-page">
      <MyApplicationsHeading />
      <MyApplicationsList forms={data?.data} invitations={invitations} />

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

export default MyApplications;
