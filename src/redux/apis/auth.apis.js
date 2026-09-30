import getEnv from "@/utils/env";
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "@/redux/store.utils";

const authApis = createApi({
  reducerPath: "authApi",
  baseQuery: createBaseQuery(`${getEnv("SERVER_URL")}/api/auth`),

  endpoints: (builder) => ({
    /////
    login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
    }),
    /////
    forgetPassword: builder.mutation({
      query: (data) => ({
        url: "/forget-password",
        method: "POST",
        body: data,
      }),
    }),
    /////
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    /////
    getMyProfileFirstTime: builder.mutation({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
    }),
    /////
    updateMyProfile: builder.mutation({
      query: (data) => ({
        url: "/me",
        method: "PUT",
        body: data,
      }),
    }),
    /////
    updateMyPassword: builder.mutation({
      query: (data) => ({
        url: "/me/password",
        method: "PUT",
        body: data,
      }),
    }),
    /////
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useUpdateMyProfileMutation,
  useUpdateMyPasswordMutation,
  useGetMyProfileFirstTimeMutation,
} = authApis;
export default authApis;
