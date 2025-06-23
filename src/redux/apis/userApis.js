import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const userApis = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/user`, credentials: 'include' }),
  tagTypes: ['User'],
  endpoints: builder => ({
    // create new user
    // ---------------
    createUser: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    // get get all users
    // --------------
    getAllUsers: builder.query({
      query: () => ({
        url: '/all',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    // get single user
    // ---------------
    getSingleUser: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'GET',
      }),
      invalidatesTags: ['User'],
    }),

    // update single user
    // ---------------
    updateSingleUser: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    // DELETE single user
    // ---------------
    deleteSingleUser: builder.mutation({
      query: data => ({
        url: `single/${data?._id}`,
        method: 'Delete',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});
export const {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetSingleUserMutation,
  useUpdateSingleUserMutation,
  useDeleteSingleUserMutation,
} = userApis;
export default userApis;
