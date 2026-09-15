import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getEnv from "@/utils/env";

const EMAIL_TEMPLATE_TAG = "EmailTemplate";

const emailTemplateApis = createApi({
  reducerPath: "emailTemplateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getEnv("SERVER_URL")}/api/email-templates`,
    credentials: "include",
  }),

  tagTypes: [EMAIL_TEMPLATE_TAG],
  endpoints: (builder) => ({
    /////
    createEmailTemplate: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [EMAIL_TEMPLATE_TAG],
    }),
    /////
    getAllEmailTemplates: builder.query({
      query: () => "/all",
      providesTags: [EMAIL_TEMPLATE_TAG],
    }),
    /////
    getSingleEmailTemplate: builder.query({
      query: (id) => `/single/${id}`,
      providesTags: [EMAIL_TEMPLATE_TAG],
    }),
    /////
    updateSingleEmailTemplate: builder.mutation({
      query: (data) => ({
        url: `/single/${data?.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [EMAIL_TEMPLATE_TAG],
    }),
    /////
    deleteSingleEmailTemplate: builder.mutation({
      query: ({ emailTemplateId }) => ({
        url: `/single/${emailTemplateId}`,
        method: "DELETE",
      }),
      invalidatesTags: [EMAIL_TEMPLATE_TAG],
    }),
    /////
    attachTemplateToForm: builder.mutation({
      query: (data) => ({
        url: "/attach",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [EMAIL_TEMPLATE_TAG],
    }),
    /////
    unAttachedFormsList: builder.query({
      query: (data) => `/all-unattached-forms?emailTemplateId=${data?.emailTemplateId}`,
      providesTags: [EMAIL_TEMPLATE_TAG],
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
