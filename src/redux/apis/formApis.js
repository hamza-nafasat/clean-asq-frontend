import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BsEmojiNeutral } from 'react-icons/bs';

const formApis = createApi({
  reducerPath: 'formApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/form`, credentials: 'include' }),

  tagTypes: ['Form', 'Strategy', 'Prompts', 'FormStrategy', 'SubmitForm', 'History'],
  endpoints: builder => ({
    // create new form
    // ---------------
    createForm: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),
    // update  form
    // ---------------
    updateForm: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update/${_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),
    // update  form location status
    // ---------------
    updateFormLocation: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-location/${_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),
    // get my all users
    // --------------
    getMyAllForms: builder.query({
      query: () => ({
        url: '/my',
        method: 'GET',
      }),
      providesTags: ['Form'],
    }),

    // get single form
    // ---------------
    getSingleFormQuery: builder.query({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'GET',
      }),
      providesTags: ['Form'],
    }),

    // DELETE single form
    // ---------------
    deleteSingleForm: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'Delete',
      }),
      invalidatesTags: ['Form'],
    }),

    // SUBMIT form
    // ---------------
    submitForm: builder.mutation({
      query: data => ({
        url: '/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Form', 'SubmitForm'],
    }),

    // get submitted form users
    // ---------------
    getSubmittedFormUsers: builder.query({
      query: ({ formId }) => ({
        url: `/submitted-users/${formId}`,
        method: 'GET',
      }),
    }),
    // give special access to user
    // ---------------
    giveSpecialAccessToUser: builder.mutation({
      query: ({ formId, submittedFormId, email, sectionKey }) => ({
        url: `/special-access-of-section/${formId}?submittedFormId=${submittedFormId}`,
        method: 'POST',
        body: { email, sectionKey },
      }),
      invalidatesTags: ['History'],
    }),
    // give special access to user
    // ---------------
    applicantGiveSpecialAccessToBeneficialOwner: builder.mutation({
      query: ({ formId, email }) => ({
        url: `/applicant-give-special-access-to-beneficial-owner/${formId}`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['History', 'SubmitForm'],
    }),
    // get special access of section
    // ---------------
    getSpecialAccessOfSection: builder.query({
      query: ({ formId, token, sectionKey }) => ({
        url: `/special-access-of-section/${formId}?token=${token}&sectionKey=${sectionKey}`,
        method: 'GET',
      }),
    }),
    // get special access of section
    // ---------------
    submitSpecialAccessForm: builder.mutation({
      query: ({ formId, token, sectionKey, formData }) => ({
        url: `/special-access-of-section/${formId}`,
        method: 'PUT',
        body: { sectionKey, formData, token },
      }),
      invalidatesTags: ['History'],
    }),

    // save form in draft
    // ---------------
    saveFormInDraft: builder.mutation({
      query: data => ({
        url: '/save-in-draft',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),

    // generate pdf form
    // ---------------
    generatePdfForm: builder.mutation({
      query: ({ _id, userId }) => ({
        url: `/generate-pdf/${_id}/${userId}`,
        method: 'GET',
        responseHandler: response => response.blob(), // important
      }),
    }),

    // get saved form
    // ---------------
    getSavedForm: builder.mutation({
      query: ({ formId }) => ({
        url: `/get-saved/${formId}`,
        method: 'GET',
      }),
      invalidatesTags: ['SubmitForm'],
    }),

    // get form history 
    // ---------------
    getFormHistory: builder.query({
      query: ({ formSubmittedId }) => ({
        url: `/get-history/${formSubmittedId}`,
        method: 'GET',
      }),
      providesTags: ['History'],
    }),

    // get saved form by userId
    // ---------------
    getSavedFormByUserId: builder.mutation({
      query: ({ formId, userId }) => ({
        url: `/get-submitted-form/${formId}/${userId}`,
        method: 'GET',
      }),
      invalidatesTags: ['SubmitForm'],
    }),

    // remove saved form
    // ---------------
    removeSavedForm: builder.mutation({
      query: ({ formId }) => ({
        url: `/remove-saved/${formId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Form'],
    }),

    // get all draft and submissions
    // ---------------
    getMyAllDraftsAndSubmittions: builder.query({
      query: () => ({
        url: '/draft-and-submitions',
        method: 'GET',
      }),
      providesTags: ['Form'],
    }),

    // update form section
    // ---------------
    updateFormSection: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-section/${_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),
    // update form fields delete and create api
    // ---------------
    updateDeleteCreateFormFields: builder.mutation({
      query: data => ({
        url: '/update-delete-create-fields',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),

    // formate display text
    // ---------------
    formateTextInMarkDown: builder.mutation({
      query: data => ({
        url: '/formate-display-text',
        method: 'POST',
        body: data,
      }),
    }),
    // get beneficial owners
    // ---------------
    getBeneficialOwnersData: builder.query({
      query: ({ email, submitId, userId }) => ({
        url: `/beneficial-owners?email=${email}&submitId=${submitId}&userId=${userId}`,
        method: 'GET',
      }),
    }),
    // update beneficial owners
    // ---------------
    updateBeneficialOwners: builder.mutation({
      query: ({ submitId, userId, form }) => ({
        url: `/beneficial-owners?submitId=${submitId}&userId=${userId}`,
        method: 'PUT',
        body: form,
      }),
    }),

    //===========================
    // Search Strategy APIs
    //===========================

    // create search strategy
    // ---------------
    createSearchStrategy: builder.mutation({
      query: ({ data }) => ({
        url: '/search-strategy/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Strategy'],
    }),
    // create search strategy default
    // ---------------
    createSearchStrategyDefault: builder.mutation({
      query: () => ({
        url: '/search-strategy/create-default',
        method: 'POST',
        body: {},
      }),
      invalidatesTags: ['Strategy'],
    }),
    // get all search strategies
    // ---------------
    getAllSearchStrategies: builder.query({
      query: () => ({
        url: '/search-strategy/all',
        method: 'GET',
      }),
      providesTags: ['Strategy'],
    }),
    // update search strategy
    // ---------------
    updateSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId, data }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Strategy'],
    }),
    // delete search strategy
    // ---------------
    deleteSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Strategy'],
    }),
    // create prompt
    // ---------------
    createPrompt: builder.mutation({
      query: ({ data }) => ({
        url: '/create-prompt',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Prompts'],
    }),
    // update prompt
    // ---------------
    updatePrompt: builder.mutation({
      query: data => ({
        url: `/prompt/single/update`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Prompts'],
    }),
    // get all prompts
    // ---------------
    getAllPrompts: builder.query({
      query: () => ({
        url: '/get-my-prompts',
        method: 'GET',
      }),
      providesTags: ['Prompts'],
    }),
    //================================
    // form strategies apis
    //================================

    // create form strategy
    // ---------------
    createFormStrategy: builder.mutation({
      query: data => ({
        url: '/form-strategy/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Strategy'],
    }),
    // get all form strategies
    // ---------------
    getAllFormStrategies: builder.query({
      query: () => ({
        url: '/form-strategy/all',
        method: 'GET',
      }),
      providesTags: ['Strategy'],
    }),
    // update form strategy
    // ---------------
    updateFormStrategy: builder.mutation({
      query: ({ FormStrategyId, data }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Strategy'],
    }),
    // delete form strategy
    // ---------------
    deleteFormStrategy: builder.mutation({
      query: ({ FormStrategyId }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Strategy'],
    }),

    // getBankLookup: builder.query({
    //   query: searchTerm => `/routing-lookup?searchTerm=${searchTerm}`,
    // }),

    getBankLookup: builder.mutation({
      query: data => ({
        url: `/routing-lookup?searchTerm=${data}`,
        method: 'GET',
      }),
    }),
    //================================
    // company verification and lookup
    //================================

    companyVerification: builder.mutation({
      query: data => ({
        url: '/verify-company',
        method: 'POST',
        body: data,
      }),
    }),
    companyLookup: builder.mutation({
      query: data => ({
        url: '/lookup-company',
        method: 'POST',
        body: data,
      }),
    }),
    findNaicAndMcc: builder.mutation({
      query: data => ({
        url: '/find-naics-to-mcc',
        method: 'POST',
        body: data,
      }),
    }),
    detectVpn: builder.mutation({
      query: data => ({
        url: '/vpn-check',
        method: 'POST',
        body: data,
      }),
    }),

    // submit form crud
    // ============================
    getAllSubmitForms: builder.query({
      query: () => ({
        url: '/all-submit',
        method: 'GET',
      }),
      providesTags: ['SubmitForm'],
    }),
    getSingleSubmitFormQuery: builder.query({
      query: data => ({
        url: `single-submit/${data?._id}`,
        method: 'GET',
      }),
      providesTags: ['SubmitForm'],
    }),
    deleteSingleSubmitForm: builder.mutation({
      query: data => ({
        url: `single-submit/${data?._id}`,
        method: 'Delete',
      }),
      invalidatesTags: ['SubmitForm'],
    }),
  }),
});
export const {
  useCreateFormMutation,
  useUpdateFormMutation,
  useUpdateFormLocationMutation,
  useGetMyAllFormsQuery,
  useGetSingleFormMutation,
  useGetSingleFormQueryQuery,
  useDeleteSingleFormMutation,
  useSubmitFormMutation,
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
  useGetAllSubmitFormsQuery,
  useGetSingleSubmitFormQueryQuery,
  useDeleteSingleSubmitFormMutation,
} = formApis;
export default formApis;
