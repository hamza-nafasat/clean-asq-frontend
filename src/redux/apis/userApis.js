import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const userApis = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/user`, credentials: 'include' }),

  endpoints: builder => ({
    // create new user
    // ---------------
    createUser: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data,
      }),
    }),
    // get get all users
    // --------------
    getAllUsers: builder.query({
      query: () => ({
        url: '/all',
        method: 'GET',
      }),
    }),

    // get single user
    // ---------------
    getSingleUser: builder.mutation({
      query: data => ({
        url: `single/:${data?._id}`,
        method: 'GET',
      }),
    }),

    // update single user
    // ---------------
    updateSingleUser: builder.mutation({
      query: data => ({
        url: `single/:${data?._id}`,
        method: 'PUT',
      }),
    }),
    // DELETE single user
    // ---------------
    deleteSingleUser: builder.mutation({
      query: data => ({
        url: `single/:${data?._id}`,
        method: 'Delete',
      }),
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
