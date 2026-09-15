import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getEnv from "@/utils/env";

const FORM_TAGS = {
  FORM: "Form",
  STRATEGY: "Strategy",
  PROMPTS: "Prompts",
  FORM_STRATEGY: "FormStrategy",
  SUBMIT_FORM: "SubmitForm",
  HISTORY: "History",
  FORM_RULES: "FormRules",
  SUBMIT_FORM_VERSIONS: "SubmitFormVersions",
};

const formApis = createApi({
  reducerPath: "formApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getEnv("SERVER_URL")}/api/form`,
    credentials: "include",
  }),
  tagTypes: Object.values(FORM_TAGS),
  endpoints: (builder) => ({
    /////
    createForm: builder.mutation({
      query: (data) => ({ url: "/create", method: "POST", body: data }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    updateForm: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    updateFormLocation: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-location/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    getMyAllForms: builder.query({
      query: () => ({ url: "/my", method: "GET" }),
      providesTags: [FORM_TAGS.FORM],
    }),
    /////
    getSingleFormQuery: builder.query({
      query: (data) => ({ url: `single/${data?._id}`, method: "GET" }),
      providesTags: [FORM_TAGS.FORM],
    }),
    /////
    cloneForm: builder.mutation({
      query: ({ sourceFormId, name }) => ({
        url: `/clone/${sourceFormId}`,
        method: "POST",
        body: name ? { name } : {},
      }),
      invalidatesTags: [FORM_TAGS.FORM, FORM_TAGS.STRATEGY],
    }),
    /////
    deleteSingleForm: builder.mutation({
      query: (data) => ({ url: `single/${data?._id}`, method: "Delete" }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    submitForm: builder.mutation({
      query: (data) => ({ url: "/submit", method: "POST", body: data }),
      invalidatesTags: [FORM_TAGS.FORM, FORM_TAGS.SUBMIT_FORM, FORM_TAGS.SUBMIT_FORM_VERSIONS],
    }),
    /////
    updateSubmittedForm: builder.mutation({
      query: ({ submittedFormId, formData }) => ({
        url: "/submit",
        method: "PUT",
        body: { submittedFormId, formData },
      }),
      invalidatesTags: [FORM_TAGS.SUBMIT_FORM, FORM_TAGS.HISTORY, FORM_TAGS.SUBMIT_FORM_VERSIONS],
    }),
    /////
    getSubmittedFormUsers: builder.query({
      query: ({ formId }) => ({
        url: `/submitted-users/${formId}`,
        method: "GET",
      }),
    }),
    /////
    giveSpecialAccessToUser: builder.mutation({
      query: ({ formId, submittedFormId, email, sectionKey }) => ({
        url: `/special-access-of-section/${formId}?submittedFormId=${submittedFormId}`,
        method: "POST",
        body: { email, sectionKey },
      }),
      invalidatesTags: [FORM_TAGS.HISTORY],
    }),
    /////
    applicantGiveSpecialAccessToBeneficialOwner: builder.mutation({
      query: ({ formId, email }) => ({
        url: `/applicant-give-special-access-to-beneficial-owner/${formId}`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: [FORM_TAGS.HISTORY, FORM_TAGS.SUBMIT_FORM],
    }),
    /////
    getSpecialAccessOfSection: builder.query({
      query: ({ formId, token, sectionKey }) => ({
        url: `/special-access-of-section/${formId}?token=${token}&sectionKey=${sectionKey}`,
        method: "GET",
      }),
      providesTags: [FORM_TAGS.FORM],
    }),
    /////
    submitSpecialAccessForm: builder.mutation({
      query: ({ formId, token, sectionKey, formData }) => ({
        url: `/special-access-of-section/${formId}`,
        method: "PUT",
        body: { sectionKey, formData, token },
      }),
      invalidatesTags: [FORM_TAGS.HISTORY],
    }),
    /////
    saveFormInDraft: builder.mutation({
      query: (data) => ({ url: "/save-in-draft", method: "POST", body: data }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    generatePdfForm: builder.mutation({
      query: ({ _id, userId }) => ({
        url: `/generate-pdf/${_id}/${userId}`,
        method: "GET",
        // read the pdf as a blob, not json
        responseHandler: (response) => response.blob(),
      }),
    }),
    /////
    getSavedForm: builder.mutation({
      query: ({ formId, draftId }) => ({
        url: `/get-saved/${formId}${draftId ? `?draftId=${draftId}` : ""}`,
        method: "GET",
      }),
      invalidatesTags: [FORM_TAGS.SUBMIT_FORM],
    }),
    /////
    getFormHistory: builder.query({
      query: ({ formSubmittedId }) => ({
        url: `/get-history/${formSubmittedId}`,
        method: "GET",
      }),
      providesTags: [FORM_TAGS.HISTORY],
    }),
    /////
    getSavedFormByUserId: builder.mutation({
      query: ({ formId, userId, pdfToken }) => ({
        url: pdfToken
          ? `/pdf-submitted-form/${formId}/${userId}?pdfToken=${encodeURIComponent(pdfToken)}`
          : `/get-submitted-form/${formId}/${userId}`,
        method: "GET",
      }),
      invalidatesTags: [FORM_TAGS.SUBMIT_FORM],
    }),
    /////
    removeSavedForm: builder.mutation({
      query: ({ formId, draftId }) => ({
        url: `/remove-saved/${formId}${draftId ? `?draftId=${draftId}` : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    getMyAllDraftsAndSubmittions: builder.query({
      query: () => ({ url: "/draft-and-submitions", method: "GET" }),
      providesTags: [FORM_TAGS.FORM],
    }),
    /////
    reorderFormSections: builder.mutation({
      query: (data) => ({
        url: "/reorder-form-sections",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    addFormSection: builder.mutation({
      query: (data) => ({
        url: "/add-form-section",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    deleteFormSection: builder.mutation({
      query: ({ sectionId }) => ({
        url: `/delete-form-section/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    updateFormSection: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-section/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    updateDeleteCreateFormFields: builder.mutation({
      query: (data) => ({
        url: "/update-delete-create-fields",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM],
    }),
    /////
    formateTextInMarkDown: builder.mutation({
      query: (data) => ({
        url: "/formate-display-text",
        method: "POST",
        body: data,
      }),
    }),
    /////
    getBeneficialOwnersData: builder.query({
      query: ({ email, submitId, userId }) => ({
        url: `/beneficial-owners?email=${email}&submitId=${submitId}&userId=${userId}`,
        method: "GET",
      }),
    }),
    /////
    updateBeneficialOwners: builder.mutation({
      query: ({ submitId, userId, form }) => ({
        url: `/beneficial-owners?submitId=${submitId}&userId=${userId}`,
        method: "PUT",
        body: form,
      }),
    }),
    /////
    createSearchStrategy: builder.mutation({
      query: ({ data }) => ({
        url: "/search-strategy/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    createSearchStrategyDefault: builder.mutation({
      query: () => ({
        url: "/search-strategy/create-default",
        method: "POST",
        body: {},
      }),
      invalidatesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    getAllSearchStrategies: builder.query({
      query: () => ({ url: "/search-strategy/all", method: "GET" }),
      providesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    updateSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId, data }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    deleteSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: "DELETE",
      }),
      invalidatesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    createPrompt: builder.mutation({
      query: ({ data }) => ({
        url: "/create-prompt",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.PROMPTS],
    }),
    /////
    updatePrompt: builder.mutation({
      query: (data) => ({
        url: `/prompt/single/update`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.PROMPTS],
    }),
    /////
    getAllPrompts: builder.query({
      query: () => ({ url: "/get-my-prompts", method: "GET" }),
      providesTags: [FORM_TAGS.PROMPTS],
    }),
    /////
    createFormStrategy: builder.mutation({
      query: (data) => ({
        url: "/form-strategy/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    getAllFormStrategies: builder.query({
      query: () => ({ url: "/form-strategy/all", method: "GET" }),
      providesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    updateFormStrategy: builder.mutation({
      query: ({ FormStrategyId, data }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    deleteFormStrategy: builder.mutation({
      query: ({ FormStrategyId }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: "DELETE",
      }),
      invalidatesTags: [FORM_TAGS.STRATEGY],
    }),
    /////
    getBankLookup: builder.mutation({
      query: (data) => ({
        url: `/routing-lookup?searchTerm=${data}`,
        method: "GET",
      }),
    }),
    /////
    companyVerification: builder.mutation({
      query: (data) => ({ url: "/verify-company", method: "POST", body: data }),
    }),
    /////
    companyLookup: builder.mutation({
      query: (data) => ({ url: "/lookup-company", method: "POST", body: data }),
    }),
    /////
    findNaicAndMcc: builder.mutation({
      query: (data) => ({
        url: "/find-naics-to-mcc",
        method: "POST",
        body: data,
      }),
    }),
    /////
    detectVpn: builder.mutation({
      query: (data) => ({ url: "/vpn-check", method: "POST", body: data }),
    }),
    /////
    getAllSubmitOrDraftForms: builder.query({
      query: () => ({ url: "/all-submit-or-draft", method: "GET" }),
      providesTags: [FORM_TAGS.SUBMIT_FORM],
    }),
    /////
    getSingleSubmitFormQuery: builder.query({
      query: (data) => ({
        url: `single-submit-or-draft/${data?._id}`,
        method: "GET",
      }),
      providesTags: [FORM_TAGS.SUBMIT_FORM],
    }),
    /////
    deleteSingleSubmitOrDraftForm: builder.mutation({
      query: ({ _id, type }) => ({
        url: `single-submit-or-draft/${_id}?type=${type}`,
        method: "Delete",
      }),
      invalidatesTags: [FORM_TAGS.SUBMIT_FORM],
    }),
    /////
    createFormRule: builder.mutation({
      query: (data) => ({
        url: "/create-form-rule",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM_RULES],
    }),
    /////
    cloneFormRules: builder.mutation({
      query: ({ sourceFormId, targetFormId }) => ({
        url: "/clone-form-rules",
        method: "POST",
        body: { sourceFormId, targetFormId },
      }),
      invalidatesTags: [FORM_TAGS.FORM_RULES],
    }),
    /////
    applyRulesOnForm: builder.query({
      query: (formSubmittedId) => ({
        url: `/apply-rules-on-form/${formSubmittedId}`,
        method: "GET",
      }),
      invalidatesTags: [FORM_TAGS.SUBMIT_FORM],
    }),
    /////
    getFormVersions: builder.query({
      query: ({ submittedFormId }) => ({
        url: `/form-versions/${submittedFormId}`,
        method: "GET",
      }),
      providesTags: [FORM_TAGS.SUBMIT_FORM_VERSIONS],
    }),
    /////
    getAllFormRules: builder.query({
      query: ({ formId }) => ({
        url: `/all-rules?formId=${formId}`,
        method: "GET",
      }),
      providesTags: [FORM_TAGS.FORM_RULES],
    }),
    /////
    deleteSingleFormRule: builder.mutation({
      query: ({ ruleId }) => ({
        url: `/single/rule/${ruleId}`,
        method: "DELETE",
      }),
      invalidatesTags: [FORM_TAGS.FORM_RULES],
    }),
    /////
    updateSingleFormRule: builder.mutation({
      query: ({ data, ruleId }) => ({
        url: `/single/rule/${ruleId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [FORM_TAGS.FORM_RULES],
    }),
    /////
    updateStatusSingleFormRule: builder.mutation({
      query: ({ ruleId, isActive }) => ({
        url: `/single/rule-status/${ruleId}`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: [FORM_TAGS.FORM_RULES],
    }),
    /////
    getFormRuleFromAi: builder.mutation({
      query: (data) => ({
        url: "/get-form-rule-from-ai",
        method: "POST",
        body: data,
      }),
    }),
    /////
    updateRulesOrder: builder.mutation({
      query: (data) => ({
        url: "/update-rules-order",
        method: "PUT",
        body: { rulesData: data },
      }),
      invalidatesTags: [FORM_TAGS.FORM_RULES],
    }),
    /////
    formDataWhichUseToCreateForms: builder.query({
      query: ({ formId }) => ({
        url: `/form-data-which-use-to-create-forms/${formId}`,
        method: "GET",
      }),
    }),
    /////
    checkFormRuleFromAi: builder.mutation({
      query: (data) => ({
        url: "/check-form-rule-from-ai",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCloneFormMutation,
  useCreateFormMutation,
  useUpdateFormMutation,
  useUpdateFormLocationMutation,
  useGetMyAllFormsQuery,
  useGetSingleFormMutation,
  useGetSingleFormQueryQuery,
  useDeleteSingleFormMutation,
  useSubmitFormMutation,
  useUpdateSubmittedFormMutation,
  useGetFormVersionsQuery,
  useGetSubmittedFormUsersQuery,
  useGiveSpecialAccessToUserMutation,
  useApplicantGiveSpecialAccessToBeneficialOwnerMutation,
  useGetSpecialAccessOfSectionQuery,
  useSubmitSpecialAccessFormMutation,
  useSaveFormInDraftMutation,
  useGetFormHistoryQuery,
  useGeneratePdfFormMutation,
  useGetSavedFormMutation,
  useGetSavedFormByUserIdMutation,
  useRemoveSavedFormMutation,
  useGetMyAllDraftsAndSubmittionsQuery,
  useReorderFormSectionsMutation,
  useAddFormSectionMutation,
  useDeleteFormSectionMutation,
  useUpdateFormSectionMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useFormateTextInMarkDownMutation,
  useGetBeneficialOwnersDataQuery,
  useUpdateBeneficialOwnersMutation,
  useCreateSearchStrategyMutation,
  useCreateSearchStrategyDefaultMutation,
  useGetAllSearchStrategiesQuery,
  useUpdateSearchStrategyMutation,
  useDeleteSearchStrategyMutation,
  useCreateFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useUpdateFormStrategyMutation,
  useDeleteFormStrategyMutation,
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useGetAllPromptsQuery,
  useGetBankLookupMutation,
  useCompanyVerificationMutation,
  useCompanyLookupMutation,
  useFindNaicAndMccMutation,
  useDetectVpnMutation,
  useGetAllSubmitOrDraftFormsQuery,
  useGetSingleSubmitFormQueryQuery,
  useDeleteSingleSubmitOrDraftFormMutation,
  useCreateFormRuleMutation,
  useCloneFormRulesMutation,
  useApplyRulesOnFormQuery,
  useGetAllFormRulesQuery,
  useDeleteSingleFormRuleMutation,
  useUpdateSingleFormRuleMutation,
  useUpdateStatusSingleFormRuleMutation,
  useGetFormRuleFromAiMutation,
  useUpdateRulesOrderMutation,
  useFormDataWhichUseToCreateFormsQuery,
  useCheckFormRuleFromAiMutation,
} = formApis;

export default formApis;
