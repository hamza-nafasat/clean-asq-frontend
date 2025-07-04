import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const formApis = createApi({
  reducerPath: 'formApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/form`, credentials: 'include' }),

  tagTypes: ['Form', 'Permission'],
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
    getSingleForm: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'GET',
      }),
      invalidatesTags: ['Form'],
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
      invalidatesTags: ['Form'],
    }),
    // SUBMIT-ARTICLE
    // ---------------
    submitFormArticleFile: builder.mutation({
      query: data => ({
        url: '/submit-article',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),
  }),
});
export const {
  useCreateFormMutation,
  useGetMyAllFormsQuery,
  useGetSingleFormMutation,
  useDeleteSingleFormMutation,
  useSubmitFormMutation,
  useSubmitFormArticleFileMutation,
} = formApis;
export default formApis;
