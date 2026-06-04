import getEnv from "@/lib/env";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import formApis from "./formApis";

const brandingApis = createApi({
  reducerPath: "brandingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getEnv("SERVER_URL")}/api/branding`,
    credentials: "include",
  }),
  tagTypes: ["Brandings"],

  endpoints: (builder) => ({
    // fetch branding
    // -------------
    fetchBranding: builder.mutation({
      query: ({ url }) => ({
        url: "/extract",
        method: "POST",
        body: { url },
      }),
    }),
    // create branding
    // --------------
    createBranding: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Brandings"],
    }),
    // get single branding
    // -----------------
    getSingleBranding: builder.query({
      query: (brandingId) => `/single/${brandingId}`,
      providesTags: ["Brandings"],
    }),

    // update single branding
    // ----------------------
    updateSingleBranding: builder.mutation({
      query: ({ brandingId, data }) => ({
        url: `/single/${brandingId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Brandings"],
    }),
    // delete single branding
    // ----------------------
    deleteSingleBranding: builder.mutation({
      query: (brandingId) => ({
        url: `/single/${brandingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brandings"],
    }),

    // get all brandings
    // ----------------
    getAllBrandings: builder.query({
      query: () => "/all",
      providesTags: ["Brandings"],
    }),

    // add branding in form
    // -------------------
    addBrandingInForm: builder.mutation({
      query: ({ brandingId, formId, onHome }) => ({
        url: "/apply/branding",
        method: "PUT",
        body: { brandingId, formId, onHome },
      }),
      invalidatesTags: ["Brandings"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(formApis.util.invalidateTags(["Form"]));
        } catch (error) {
          console.error("Error adding branding in form:", error);
        }
      },
    }),

    // extract colors from logos (file upload)
    // ----------------------------------------
    extractColorsFromLogos: builder.mutation({
      query: (formData) => ({
        url: "/extract-colors-from-logo",
        method: "POST",
        body: formData,
      }),
    }),

    // extract colors from a saved logo URL (on logo selection)
    // ---------------------------------------------------------
    extractColorsFromLogoUrl: builder.mutation({
      query: ({ url }) => ({
        url: "/extract-colors-from-logo-url",
        method: "POST",
        body: { url },
      }),
    }),

    // get manual extraction script
    // ----------------------------
    // Returns the browser-side JS script string for the manual extraction flow.
    // Cached indefinitely — the script only changes on backend deploy.
    getManualExtractionScript: builder.query({
      query: () => "/manual-extraction-script",
    }),
  }),
});

export const {
  useFetchBrandingMutation,
  useCreateBrandingMutation,
  useGetSingleBrandingQuery,
  useUpdateSingleBrandingMutation,
  useDeleteSingleBrandingMutation,
  useGetAllBrandingsQuery,
  useAddBrandingInFormMutation,
  useExtractColorsFromLogosMutation,
  useExtractColorsFromLogoUrlMutation,
  useGetManualExtractionScriptQuery,
} = brandingApis;
export default brandingApis;
