import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const formApis = createApi({
  reducerPath: 'formApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/form`, credentials: 'include' }),

  tagTypes: ['Form'],
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
} = formApis;
export default formApis;
