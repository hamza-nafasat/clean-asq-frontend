import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const brandingApis = createApi({
  reducerPath: 'brandingApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/branding`, credentials: 'include' }),

  endpoints: builder => ({
    // fetch branding
    // -------------
    fetchBranding: builder.mutation({
      query: ({ url }) => ({
        url: '/extract',
        method: 'POST',
        body: { url },
      }),
      invalidatesTags: ['Branding'],
    }),
    // create branding
    // --------------
    createBranding: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Branding'],
    }),
    // get single branding
    // -----------------
    getSingleBranding: builder.query({
      query: brandingId => `/single/${brandingId}`,
      providesTags: (result, error, brandingId) => [{ type: 'Branding', id: brandingId }],
    }),

    // update single branding
    // ----------------------
    updateSingleBranding: builder.mutation({
      query: ({ brandingId, ...data }) => ({
        url: `/single/${brandingId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { brandingId }) => [{ type: 'Branding', id: brandingId }],
    }),
    // delete single branding
    // ----------------------
    deleteSingleBranding: builder.mutation({
      query: brandingId => ({
        url: `/single/${brandingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, brandingId) => [{ type: 'Branding', id: brandingId }],
    }),

    // get all brandings
    // ----------------
    getAllBrandings: builder.query({
      query: () => '/all',
      providesTags: ['Branding'],
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
} = brandingApis;
export default brandingApis;
