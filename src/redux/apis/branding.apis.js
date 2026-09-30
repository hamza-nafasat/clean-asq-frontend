import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "@/redux/store.utils";
import formApis from "@/redux/apis/form.apis";
import { API_TAGS, DEFAULT_BRANDING_TAG_ID } from "@/constants";
import getEnv from "@/utils/env";

// forms show their branding, so refresh them too
const refreshFormsOnSuccess = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(formApis.util.invalidateTags([API_TAGS.FORM, API_TAGS.SINGLE_FORM]));
  } catch (error) {
    console.error("Refresh forms error:", error);
  }
};

const brandingApis = createApi({
  reducerPath: "brandingApi",
  baseQuery: createBaseQuery(`${getEnv("SERVER_URL")}/api/branding`),
  tagTypes: [API_TAGS.BRANDINGS, API_TAGS.SINGLE_BRANDING],

  endpoints: (builder) => ({
    /////
    fetchBranding: builder.mutation({
      query: ({ url }) => ({ url: "/extract", method: "POST", body: { url } }),
    }),
    /////
    fetchWebsiteBranding: builder.mutation({
      query: ({ url }) => ({ url: "/extraction/fetch-website-branding", method: "POST", body: { url } }),
    }),
    /////
    createBranding: builder.mutation({
      query: (data) => ({ url: "/create", method: "POST", body: data }),
      invalidatesTags: [API_TAGS.BRANDINGS],
    }),
    /////
    getSingleBranding: builder.query({
      query: (brandingId) => `/single/${brandingId}`,
      providesTags: (result, error, brandingId) => [{ type: API_TAGS.SINGLE_BRANDING, id: brandingId }],
    }),
    /////
    updateSingleBranding: builder.mutation({
      query: ({ brandingId, data }) => ({ url: `/single/${brandingId}`, method: "PUT", body: data }),
      invalidatesTags: (result, error, { brandingId }) => [
        API_TAGS.BRANDINGS,
        { type: API_TAGS.SINGLE_BRANDING, id: brandingId },
        { type: API_TAGS.SINGLE_BRANDING, id: DEFAULT_BRANDING_TAG_ID },
      ],
      onQueryStarted: refreshFormsOnSuccess,
    }),
    /////
    deleteSingleBranding: builder.mutation({
      query: (brandingId) => ({ url: `/single/${brandingId}`, method: "DELETE" }),
      invalidatesTags: (result, error, brandingId) => [
        API_TAGS.BRANDINGS,
        { type: API_TAGS.SINGLE_BRANDING, id: brandingId },
        { type: API_TAGS.SINGLE_BRANDING, id: DEFAULT_BRANDING_TAG_ID },
      ],
      onQueryStarted: refreshFormsOnSuccess,
    }),
    /////
    getAllBrandings: builder.query({
      query: () => "/all",
      providesTags: [API_TAGS.BRANDINGS],
    }),
    /////
    addBrandingInForm: builder.mutation({
      query: ({ brandingId, formId, onHome }) => ({
        url: "/apply/branding",
        method: "PUT",
        body: { brandingId, formId, onHome },
      }),
      invalidatesTags: (result, error, { brandingId }) => [
        API_TAGS.BRANDINGS,
        { type: API_TAGS.SINGLE_BRANDING, id: brandingId },
      ],
      onQueryStarted: refreshFormsOnSuccess,
    }),
    /////
    getDefaultBranding: builder.query({
      query: () => "/default",
      providesTags: [{ type: API_TAGS.SINGLE_BRANDING, id: DEFAULT_BRANDING_TAG_ID }],
    }),
    /////
    setDefaultBranding: builder.mutation({
      query: (brandingId) => ({ url: `/default/${brandingId}`, method: "PUT" }),
      invalidatesTags: [API_TAGS.BRANDINGS, { type: API_TAGS.SINGLE_BRANDING, id: DEFAULT_BRANDING_TAG_ID }],
    }),
    /////
    clearDefaultBranding: builder.mutation({
      query: () => ({ url: "/default", method: "DELETE" }),
      invalidatesTags: [API_TAGS.BRANDINGS, { type: API_TAGS.SINGLE_BRANDING, id: DEFAULT_BRANDING_TAG_ID }],
    }),
    /////
    extractColorsFromLogos: builder.mutation({
      query: (formData) => ({ url: "/extract-colors-from-logo", method: "POST", body: formData }),
    }),
    /////
    extractColorsFromLogoUrl: builder.mutation({
      query: ({ url }) => ({ url: "/extract-colors-from-logo-url", method: "POST", body: { url } }),
    }),
    /////
    processManualBranding: builder.mutation({
      query: ({ domData }) => ({ url: "/extraction/process-manual-branding", method: "POST", body: { domData } }),
    }),
    /////
    // cached until a backend deploy
    getManualExtractionScript: builder.query({
      query: () => "/manual-extraction-script",
    }),
  }),
});

export const {
  useFetchBrandingMutation,
  useFetchWebsiteBrandingMutation,
  useCreateBrandingMutation,
  useGetSingleBrandingQuery,
  useUpdateSingleBrandingMutation,
  useDeleteSingleBrandingMutation,
  useGetAllBrandingsQuery,
  useAddBrandingInFormMutation,
  useExtractColorsFromLogosMutation,
  useExtractColorsFromLogoUrlMutation,
  useGetManualExtractionScriptQuery,
  useProcessManualBrandingMutation,
  useGetDefaultBrandingQuery,
  useSetDefaultBrandingMutation,
  useClearDefaultBrandingMutation,
} = brandingApis;
export default brandingApis;
