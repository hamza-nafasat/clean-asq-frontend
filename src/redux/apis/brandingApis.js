import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const brandingApis = createApi({
  reducerPath: 'brandingApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/branding`, credentials: 'include' }),
  tagTypes: ['Brandings'],

  endpoints: builder => ({
    // fetch branding
    // -------------
    fetchBranding: builder.mutation({
      query: ({ url }) => ({
        url: '/extract',
        method: 'POST',
        body: { url },
      }),
    }),
    // create branding
    // --------------
    createBranding: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Brandings'],
    }),
    // get single branding
    // -----------------
    getSingleBranding: builder.query({
      query: brandingId => `/single/${brandingId}`,
      providesTags: ['Brandings'],
    }),

    // update single branding
    // ----------------------
    updateSingleBranding: builder.mutation({
      query: ({ brandingId, data }) => ({
        url: `/single/${brandingId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Brandings'],
    }),
    // delete single branding
    // ----------------------
    deleteSingleBranding: builder.mutation({
      query: brandingId => ({
        url: `/single/${brandingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Brandings'],
    }),

    // get all brandings
    // ----------------
    getAllBrandings: builder.query({
      query: () => '/all',
      providesTags: ['Brandings'],
    }),

    // add branding in form
    // -------------------
    addBrandingInForm: builder.mutation({
      query: ({ brandingId, formId }) => ({
        url: '/apply/branding',
        method: 'PUT',
        body: { brandingId, formId },
      }),
      invalidatesTags: ['Brandings'],
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
} = brandingApis;
export default brandingApis;
