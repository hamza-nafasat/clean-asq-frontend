import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BsEmojiNeutral } from 'react-icons/bs';

const formApis = createApi({
  reducerPath: 'formApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/form`, credentials: 'include' }),

  tagTypes: ['Form', 'Strategy', 'prompts', 'FormStrategy'],
  endpoints: builder => ({
    // create new form
    // ---------------
    createForm: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
    }),
    // update  form location status
    // ---------------
    updateForm: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-location/${_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
    }),
    // get my all users
    // --------------
    getMyAllForms: builder.query({
      query: () => ({
        url: '/my',
        method: 'GET',
      }),
      providesTags: [{ type: 'Form', id: 'LIST' }],
    }),

    // get single form
    // ---------------
    getSingleForm: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'GET',
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
    }),
    getSingleFormQuery: builder.query({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Form', id: 'LIST' }],
    }),

    // DELETE single form
    // ---------------
    deleteSingleForm: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'Delete',
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
    }),

    // SUBMIT form
    // ---------------
    submitForm: builder.mutation({
      query: data => ({
        url: '/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
    }),

    // save form in draft
    // ---------------
    saveFormInDraft: builder.mutation({
      query: data => ({
        url: '/save-in-draft',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
    }),

    // get saved form
    // ---------------
    getSavedForm: builder.mutation({
      query: ({ formId }) => ({
        url: `/get-saved/${formId}`,
        method: 'GET',
      }),
    }),
    // update form section
    // ---------------
    updateFormSection: builder.mutation({
      query: ({ data, _id }) => ({
        url: `/update-form-section/${_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
    }),
    // update form fields delete and create api
    // ---------------
    updateDeleteCreateFormFields: builder.mutation({
      query: data => ({
        url: '/update-delete-create-fields',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Form', id: 'LIST' }],
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
      invalidatesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // create search strategy default
    // ---------------
    createSearchStrategyDefault: builder.mutation({
      query: () => ({
        url: '/search-strategy/create-default',
        method: 'POST',
        body: {},
      }),
      invalidatesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // get all search strategies
    // ---------------
    getAllSearchStrategies: builder.query({
      query: () => ({
        url: '/search-strategy/all',
        method: 'GET',
      }),
      providesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // update search strategy
    // ---------------
    updateSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId, data }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // delete search strategy
    // ---------------
    deleteSearchStrategy: builder.mutation({
      query: ({ SearchStrategyId }) => ({
        url: `/search-strategy/single/${SearchStrategyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // create prompt
    // ---------------
    createPrompt: builder.mutation({
      query: ({ data }) => ({
        url: '/create-prompt',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Prompt', id: 'LIST' }],
    }),
    // update prompt
    // ---------------
    updatePrompt: builder.mutation({
      query: data => ({
        url: `/prompt/single/update`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Prompt', id: 'LIST' }],
    }),
    // get all prompts
    // ---------------
    getAllPrompts: builder.query({
      query: () => ({
        url: '/get-my-prompts',
        method: 'GET',
      }),
      providesTags: [{ type: 'Prompt', id: 'LIST' }],
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
      invalidatesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // get all form strategies
    // ---------------
    getAllFormStrategies: builder.query({
      query: () => ({
        url: '/form-strategy/all',
        method: 'GET',
      }),
      providesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // update form strategy
    // ---------------
    updateFormStrategy: builder.mutation({
      query: ({ FormStrategyId, data }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'Strategy', id: 'LIST' }],
    }),
    // delete form strategy
    // ---------------
    deleteFormStrategy: builder.mutation({
      query: ({ FormStrategyId }) => ({
        url: `/form-strategy/single/${FormStrategyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Strategy', id: 'LIST' }],
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
  }),
});
export const {
  useCreateFormMutation,
  useUpdateFormMutation,
  useGetMyAllFormsQuery,
  useGetSingleFormMutation,
  useGetSingleFormQueryQuery,
  useDeleteSingleFormMutation,
  useSubmitFormMutation,
  useSaveFormInDraftMutation,
  useGetSavedFormMutation,
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
  useCompanyVerificationMutation,
  useCompanyLookupMutation,
  useFindNaicAndMccMutation,
  useDetectVpnMutation,
} = formApis;
export default formApis;
