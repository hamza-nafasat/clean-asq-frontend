import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_TAGS, PDF_VIEW_PARAMS } from "@/constants";
import getEnv from "@/utils/env";

const formApis = createApi({
  reducerPath: "formApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getEnv("SERVER_URL")}/api/form`,
    credentials: "include",
  }),
  tagTypes: Object.values(API_TAGS),
  endpoints: (builder) => ({
    /////
    createForm: builder.mutation({
      query: (data) => ({ url: "/create", method: "POST", body: data }),
      invalidatesTags: [API_TAGS.FORM],
    }),
    /////
    updateForm: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [API_TAGS.FORM, { type: API_TAGS.SINGLE_FORM, id: _id }],
    }),
    /////
    updateFormLocation: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-location/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [API_TAGS.FORM, { type: API_TAGS.SINGLE_FORM, id: _id }],
    }),
    /////
    getMyAllForms: builder.query({
      query: () => ({ url: "/my", method: "GET" }),
      providesTags: [API_TAGS.FORM],
    }),
    /////
    getSingleFormQuery: builder.query({
      // the pdf page's token unlocks hidden sections
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "GET",
        params: { [PDF_VIEW_PARAMS.PDF_TOKEN]: data?.pdfToken },
      }),
      providesTags: (result, error, data) => [{ type: API_TAGS.SINGLE_FORM, id: data?._id }],
    }),
    /////
    cloneForm: builder.mutation({
      query: ({ sourceFormId, name }) => ({
        url: `/clone/${sourceFormId}`,
        method: "POST",
        body: name ? { name } : {},
      }),
      invalidatesTags: [API_TAGS.FORM, API_TAGS.FORM_STRATEGIES],
    }),
    /////
    deleteSingleForm: builder.mutation({
      query: (data) => ({ url: `single/${data?._id}`, method: "Delete" }),
      invalidatesTags: (result, error, data) => [
        API_TAGS.FORM,
        { type: API_TAGS.SINGLE_FORM, id: data?._id },
        API_TAGS.FORM_STRATEGIES,
      ],
    }),
    /////
    submitForm: builder.mutation({
      query: (data) => ({ url: "/submit", method: "POST", body: data }),
      invalidatesTags: [API_TAGS.SUBMIT_FORM, API_TAGS.SUBMIT_FORM_VERSIONS, API_TAGS.MY_APPLICATIONS],
    }),
    /////
    updateSubmittedForm: builder.mutation({
      query: ({ submittedFormId, formData }) => ({
        url: "/submit",
        method: "PUT",
        body: { submittedFormId, formData },
      }),
      invalidatesTags: [API_TAGS.SUBMIT_FORM, API_TAGS.HISTORY, API_TAGS.SUBMIT_FORM_VERSIONS, API_TAGS.MY_APPLICATIONS],
    }),
    /////
    updateApplication: builder.mutation({
      query: ({ submissionId, formData }) => ({ url: `/application/${submissionId}`, method: "PUT", body: { formData } }),
      invalidatesTags: [API_TAGS.SUBMIT_FORM, API_TAGS.HISTORY, API_TAGS.SUBMIT_FORM_VERSIONS],
    }),
    /////
    giveSpecialAccessToUser: builder.mutation({
      query: ({ formId, submittedFormId, email, sectionKey }) => ({
        url: `/special-access-of-section/${formId}?submittedFormId=${submittedFormId}`,
        method: "POST",
        body: { email, sectionKey },
      }),
      invalidatesTags: [API_TAGS.HISTORY],
    }),
    /////
    applicantGiveSpecialAccessToBeneficialOwner: builder.mutation({
      query: ({ formId, submissionId, email }) => ({
        url: `/applicant-give-special-access-to-beneficial-owner/${formId}`,
        method: "POST",
        body: { email, submissionId },
      }),
      invalidatesTags: [API_TAGS.HISTORY, API_TAGS.SUBMIT_FORM, API_TAGS.MY_APPLICATIONS],
    }),
    /////
    getSpecialAccessOfSection: builder.query({
      query: ({ formId, token, sectionKey }) => ({
        url: `/special-access-of-section/${formId}?token=${token}&sectionKey=${sectionKey}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.FORM],
    }),
    /////
    submitSpecialAccessForm: builder.mutation({
      query: ({ formId, token, sectionKey, formData }) => ({
        url: `/special-access-of-section/${formId}`,
        method: "PUT",
        body: { sectionKey, formData, token },
      }),
      invalidatesTags: [API_TAGS.HISTORY, API_TAGS.MY_APPLICATIONS],
    }),
    /////
    saveFormInDraft: builder.mutation({
      query: (data) => ({ url: "/save-in-draft", method: "POST", body: data }),
      invalidatesTags: [API_TAGS.MY_APPLICATIONS],
    }),
    /////
    generatePdfForm: builder.mutation({
      query: ({ _id, userId, submissionId }) => ({
        url: `/generate-pdf/${_id}/${userId}`,
        params: { submissionId: submissionId || undefined },
        method: "GET",
        // read the pdf as a blob, not json
        responseHandler: (response) => response.blob(),
      }),
    }),
    /////
    generateApplicationPdf: builder.mutation({
      query: ({ submissionId }) => ({
        url: `/application-pdf/${submissionId}`,
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
    }),
    /////
    getFormHistory: builder.query({
      query: ({ formSubmittedId }) => ({
        url: `/get-history/${formSubmittedId}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.HISTORY],
    }),
    /////
    getSavedFormByUserId: builder.mutation({
      query: ({ formId, userId, pdfToken, submissionId }) => ({
        url: pdfToken
          ? `/pdf-submitted-form/${formId}/${userId}?pdfToken=${encodeURIComponent(pdfToken)}`
          : `/get-submitted-form/${formId}/${userId}`,
        // only the pdf page reads one exact submission
        params: pdfToken ? { submissionId: submissionId || undefined } : undefined,
        method: "GET",
      }),
      invalidatesTags: [API_TAGS.SUBMIT_FORM],
    }),
    /////
    removeSavedForm: builder.mutation({
      query: ({ formId, draftId }) => ({
        url: `/remove-saved/${formId}${draftId ? `?draftId=${draftId}` : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.MY_APPLICATIONS],
    }),
    /////
    getMyApplications: builder.query({
      query: () => ({ url: "/my-applications", method: "GET" }),
      providesTags: [API_TAGS.MY_APPLICATIONS],
    }),
    /////
    reorderFormSections: builder.mutation({
      query: (data) => ({
        url: "/reorder-form-sections",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM, API_TAGS.SINGLE_FORM, API_TAGS.FORM_CREATION_DATA],
    }),
    /////
    addFormSection: builder.mutation({
      query: (data) => ({
        url: "/add-form-section",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM, API_TAGS.SINGLE_FORM, API_TAGS.FORM_CREATION_DATA],
    }),
    /////
    deleteFormSection: builder.mutation({
      query: ({ sectionId }) => ({
        url: `/delete-form-section/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.FORM, API_TAGS.SINGLE_FORM, API_TAGS.FORM_CREATION_DATA],
    }),
    /////
    updateFormSection: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-section/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM, API_TAGS.SINGLE_FORM, API_TAGS.FORM_CREATION_DATA],
    }),
    /////
    updateDeleteCreateFormFields: builder.mutation({
      query: (data) => ({
        url: "/update-delete-create-fields",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM, API_TAGS.SINGLE_FORM, API_TAGS.FORM_CREATION_DATA],
    }),
    /////
    addFormField: builder.mutation({
      query: (data) => ({
        url: "/create-field",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM, API_TAGS.SINGLE_FORM, API_TAGS.FORM_CREATION_DATA],
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
    createSearchStrategy: builder.mutation({
      query: ({ data }) => ({
        url: "/search-strategy/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.SEARCH_STRATEGIES, API_TAGS.FORM_STRATEGIES],
    }),
    /////
    createSearchStrategyDefault: builder.mutation({
      query: () => ({
        url: "/search-strategy/create-default",
        method: "POST",
        body: {},
      }),
      invalidatesTags: [API_TAGS.SEARCH_STRATEGIES, API_TAGS.FORM_STRATEGIES],
    }),
    /////
    getAllSearchStrategies: builder.query({
      query: () => ({ url: "/search-strategy/all", method: "GET" }),
      providesTags: [API_TAGS.SEARCH_STRATEGIES],
    }),
    /////
    updateSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId, data }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [API_TAGS.SEARCH_STRATEGIES, API_TAGS.FORM_STRATEGIES],
    }),
    /////
    deleteSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.SEARCH_STRATEGIES, API_TAGS.FORM_STRATEGIES],
    }),
    /////
    updatePrompt: builder.mutation({
      query: (data) => ({
        url: `/prompt/single/update`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [API_TAGS.PROMPTS],
    }),
    /////
    getAllPrompts: builder.query({
      query: () => ({ url: "/get-my-prompts", method: "GET" }),
      providesTags: [API_TAGS.PROMPTS],
    }),
    /////
    createFormStrategy: builder.mutation({
      query: (data) => ({
        url: "/form-strategy/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM_STRATEGIES],
    }),
    /////
    getAllFormStrategies: builder.query({
      query: () => ({ url: "/form-strategy/all", method: "GET" }),
      providesTags: [API_TAGS.FORM_STRATEGIES],
    }),
    /////
    updateFormStrategy: builder.mutation({
      query: ({ FormStrategyId, data }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM_STRATEGIES],
    }),
    /////
    deleteFormStrategy: builder.mutation({
      query: ({ FormStrategyId }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.FORM_STRATEGIES],
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
      providesTags: [API_TAGS.SUBMIT_FORM],
    }),
    /////
    getSingleSubmitFormQuery: builder.query({
      query: (data) => ({
        url: `single-submit-or-draft/${data?._id}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.SUBMIT_FORM],
    }),
    /////
    deleteSingleSubmitOrDraftForm: builder.mutation({
      query: ({ _id, type }) => ({
        url: `single-submit-or-draft/${_id}?type=${type}`,
        method: "Delete",
      }),
      invalidatesTags: [API_TAGS.SUBMIT_FORM],
    }),
    /////
    createFormRule: builder.mutation({
      query: (data) => ({
        url: "/create-form-rule",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM_RULES],
    }),
    /////
    cloneFormRules: builder.mutation({
      query: ({ sourceFormId, targetFormId }) => ({
        url: "/clone-form-rules",
        method: "POST",
        body: { sourceFormId, targetFormId },
      }),
      invalidatesTags: [API_TAGS.FORM_RULES],
    }),
    /////
    previewRulesOnForm: builder.query({
      query: (formSubmittedId) => ({ url: `/preview-rules-on-form/${formSubmittedId}`, method: "GET" }),
      // who would be emailed changes with every edit
      keepUnusedDataFor: 0,
    }),
    /////
    applyRulesOnForm: builder.mutation({
      query: ({ formSubmittedId, sendEmails }) => ({
        url: `/apply-rules-on-form/${formSubmittedId}`,
        method: "POST",
        body: { sendEmails },
      }),
      invalidatesTags: [API_TAGS.SUBMIT_FORM, API_TAGS.HISTORY],
    }),
    /////
    getFormVersions: builder.query({
      query: ({ submittedFormId }) => ({
        url: `/form-versions/${submittedFormId}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.SUBMIT_FORM_VERSIONS],
    }),
    /////
    getAllFormRules: builder.query({
      query: ({ formId }) => ({
        url: `/all-rules?formId=${formId}`,
        method: "GET",
      }),
      providesTags: [API_TAGS.FORM_RULES],
    }),
    /////
    deleteSingleFormRule: builder.mutation({
      query: ({ ruleId }) => ({
        url: `/single/rule/${ruleId}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.FORM_RULES],
    }),
    /////
    updateSingleFormRule: builder.mutation({
      query: ({ data, ruleId }) => ({
        url: `/single/rule/${ruleId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [API_TAGS.FORM_RULES],
    }),
    /////
    updateStatusSingleFormRule: builder.mutation({
      query: ({ ruleId, isActive }) => ({
        url: `/single/rule-status/${ruleId}`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: [API_TAGS.FORM_RULES],
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
      invalidatesTags: [API_TAGS.FORM_RULES],
    }),
    /////
    formDataWhichUseToCreateForms: builder.query({
      query: ({ formId }) => ({
        url: `/form-data-which-use-to-create-forms/${formId}`,
        method: "GET",
      }),
      providesTags: (result, error, { formId }) => [{ type: API_TAGS.FORM_CREATION_DATA, id: formId }],
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
  useGetSingleFormQueryQuery,
  useLazyGetSingleFormQueryQuery,
  useDeleteSingleFormMutation,
  useSubmitFormMutation,
  useUpdateSubmittedFormMutation,
  useUpdateApplicationMutation,
  useGetFormVersionsQuery,
  useGiveSpecialAccessToUserMutation,
  useApplicantGiveSpecialAccessToBeneficialOwnerMutation,
  useGetSpecialAccessOfSectionQuery,
  useSubmitSpecialAccessFormMutation,
  useSaveFormInDraftMutation,
  useGetFormHistoryQuery,
  useGeneratePdfFormMutation,
  useGenerateApplicationPdfMutation,
  useGetSavedFormMutation,
  useGetSavedFormByUserIdMutation,
  useRemoveSavedFormMutation,
  useGetMyApplicationsQuery,
  useReorderFormSectionsMutation,
  useAddFormSectionMutation,
  useDeleteFormSectionMutation,
  useUpdateFormSectionMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useAddFormFieldMutation,
  useFormateTextInMarkDownMutation,
  useCreateSearchStrategyMutation,
  useCreateSearchStrategyDefaultMutation,
  useGetAllSearchStrategiesQuery,
  useUpdateSearchStrategyMutation,
  useDeleteSearchStrategyMutation,
  useCreateFormStrategyMutation,
  useGetAllFormStrategiesQuery,
  useUpdateFormStrategyMutation,
  useDeleteFormStrategyMutation,
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
  useApplyRulesOnFormMutation,
  useLazyPreviewRulesOnFormQuery,
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
