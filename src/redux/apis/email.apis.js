import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_TAGS } from "@/constants";
import getEnv from "@/utils/env";

const emailApis = createApi({
  reducerPath: "emailTemplateApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv("SERVER_URL")}/api/email-templates`, credentials: "include" }),
  tagTypes: [API_TAGS.EMAIL_TEMPLATES, API_TAGS.SINGLE_EMAIL_TEMPLATE],
  endpoints: (builder) => ({
    /////
    createEmailTemplate: builder.mutation({
      query: (data) => ({ url: "/create", method: "POST", body: data }),
      invalidatesTags: [API_TAGS.EMAIL_TEMPLATES],
    }),
    /////
    getAllEmailTemplates: builder.query({
      query: () => ({ url: "/all", method: "GET" }),
      providesTags: [API_TAGS.EMAIL_TEMPLATES],
    }),
    /////
    updateSingleEmailTemplate: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/single/${id}`, method: "PUT", body: data }),
      invalidatesTags: (result, error, { id }) => [
        API_TAGS.EMAIL_TEMPLATES,
        { type: API_TAGS.SINGLE_EMAIL_TEMPLATE, id },
      ],
    }),
    /////
    deleteSingleEmailTemplate: builder.mutation({
      query: ({ emailTemplateId }) => ({ url: `/single/${emailTemplateId}`, method: "DELETE" }),
      invalidatesTags: (result, error, { emailTemplateId }) => [
        API_TAGS.EMAIL_TEMPLATES,
        { type: API_TAGS.SINGLE_EMAIL_TEMPLATE, id: emailTemplateId },
      ],
    }),
    /////
    attachTemplateToForm: builder.mutation({
      query: (data) => ({ url: "/attach", method: "PUT", body: data }),
      invalidatesTags: (result, error, { emailTemplateId }) => [
        API_TAGS.EMAIL_TEMPLATES,
        { type: API_TAGS.SINGLE_EMAIL_TEMPLATE, id: emailTemplateId },
      ],
    }),
    /////
    // forms free for this template's type, plus its own
    unAttachedFormsList: builder.query({
      query: ({ emailTemplateId }) => ({ url: "/all-unattached-forms", method: "GET", params: { emailTemplateId } }),
      // other templates of the same type change it too
      providesTags: (result, error, { emailTemplateId }) => [
        API_TAGS.EMAIL_TEMPLATES,
        { type: API_TAGS.SINGLE_EMAIL_TEMPLATE, id: emailTemplateId },
      ],
    }),
  }),
});

export const {
  useCreateEmailTemplateMutation,
  useGetAllEmailTemplatesQuery,
  useUpdateSingleEmailTemplateMutation,
  useDeleteSingleEmailTemplateMutation,
  useAttachTemplateToFormMutation,
  useUnAttachedFormsListQuery,
} = emailApis;
export default emailApis;
