import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BsEmojiNeutral } from 'react-icons/bs';

const formApis = createApi({
  reducerPath: 'formApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/form`, credentials: 'include' }),

  tagTypes: ['Form', 'Strategy', 'prompts'],
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
    // SUBMIT-ARTICLE
    // ---------------
    submitFormArticleFile: builder.mutation({
      query: data => ({
        url: '/submit-article',
        method: 'POST',
        body: data,
      }),
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
  }),
});
export const {
  useCreateFormMutation,
  useGetMyAllFormsQuery,
  useGetSingleFormMutation,
  useGetSingleFormQueryQuery,
  useDeleteSingleFormMutation,
  useSubmitFormMutation,
  useSubmitFormArticleFileMutation,
  useUpdateDeleteCreateFormFieldsMutation,
  useFormateTextInMarkDownMutation,
  useGetBeneficialOwnersDataQuery,
  useUpdateBeneficialOwnersMutation,
  useCreateSearchStrategyMutation,
  useGetAllSearchStrategiesQuery,
  useUpdateSearchStrategyMutation,
  useDeleteSearchStrategyMutation,
  useCreatePromptMutation,
  useUpdatePromptMutation,
  useGetAllPromptsQuery,
  useCompanyVerificationMutation,
  useCompanyLookupMutation,
} = formApis;
export default formApis;
