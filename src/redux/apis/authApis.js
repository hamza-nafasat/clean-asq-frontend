import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const authApis = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/auth`, credentials: 'include' }),

  endpoints: builder => ({
    // login
    // -----
    login: builder.mutation({
      query: data => ({
        url: '/login',
        method: 'POST',
        body: data,
      }),
    }),

    getMyProfileFirstTime: builder.mutation({
      query: () => ({
        url: '/me',
        method: 'GET',
      }),
    }),

    // get my profile
    // --------------
    getMyProfile: builder.query({
      query: () => ({
        url: '/me',
        method: 'GET',
      }),
    }),

    // updateMyProfile
    // ---------------
    updateMyProfile: builder.mutation({
      query: data => ({
        url: '/me',
        method: 'PUT',
        body: data,
      }),
    }),

    // logout
    // ------
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMyProfileQuery,
  useLogoutMutation,
  useUpdateMyProfileMutation,
  useGetMyProfileFirstTimeMutation,
} = authApis;
export default authApis;
