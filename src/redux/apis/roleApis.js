import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const roleApis = createApi({
  reducerPath: 'roleApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/role`, credentials: 'include' }),

  tagTypes: ['Role', 'Permission'],
  endpoints: builder => ({
    // create new role
    // ---------------
    createRole: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Role'],
    }),
    // get get all users
    // --------------
    getAllRoles: builder.query({
      query: () => ({
        url: '/all',
        method: 'GET',
      }),
      providesTags: ['Role'],
    }),

    // get single role
    // ---------------
    getSingleRole: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'GET',
      }),
      invalidatesTags: ['Role'],
    }),

    // update single role
    // ---------------
    updateSingleRole: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Role'],
    }),
    // DELETE single role
    // ---------------
    deleteSingleRole: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'Delete',
      }),
      invalidatesTags: ['Role'],
    }),
    // get all permissions
    // ------------------
    getAllPermissions: builder.query({
      query: () => ({
        url: '/permissions',
        method: 'GET',
      }),
      providesTags: ['Permission'],
    }),
  }),
});
export const {
  useCreateRoleMutation,
  useGetAllRolesQuery,
  useGetSingleRoleMutation,
  useUpdateSingleRoleMutation,
  useDeleteSingleRoleMutation,
  useGetAllPermissionsQuery,
} = roleApis;
export default roleApis;
