import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const emailTemplateApis = createApi({
  reducerPath: 'emailTemplateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getEnv('SERVER_URL')}/api/email-templates`,
    credentials: 'include',
  }),

  tagTypes: ['EmailTemplate'],
  endpoints: builder => ({
    // Create
    createEmailTemplate: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    // Get All
    getAllEmailTemplates: builder.query({
      query: () => '/all',
      providesTags: ['EmailTemplate'],
    }),

    // Get Single
    getSingleEmailTemplate: builder.query({
      query: id => `/single/${id}`,
      providesTags: ['EmailTemplate'],
    }),

    // Update
    updateSingleEmailTemplate: builder.mutation({
      query: data => ({
        url: `/single/${data?.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    // Delete
    deleteSingleEmailTemplate: builder.mutation({
      query: ({ emailTemplateId }) => ({
        url: `/single/${emailTemplateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmailTemplate'],
    }),

    // attach to forms
    attachTemplateToForm: builder.mutation({
      query: data => ({
        url: '/attach',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EmailTemplate'],
    }),
    // unattached forms list

    unAttachedFormsList: builder.query({
      query: data => `/all-unattached-forms?emailTemplateId=${data?.emailTemplateId}`,
      providesTags: ['EmailTemplate'],
    }),
  }),
});

export const {
  useCreateEmailTemplateMutation,
  useGetAllEmailTemplatesQuery,
  useGetSingleEmailTemplateQuery,
  useUpdateSingleEmailTemplateMutation,
  useDeleteSingleEmailTemplateMutation,
  useAttachTemplateToFormMutation,
  useUnAttachedFormsListQuery,
} = emailTemplateApis;
export default emailTemplateApis;
