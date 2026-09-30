import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "@/redux/store.utils";
import getEnv from "@/utils/env";

const applicantApis = createApi({
  reducerPath: "applicantApi",
  baseQuery: createBaseQuery(`${getEnv("SERVER_URL")}/api/id-mission`),
  endpoints: (builder) => ({
    /////
    getIdMissionSession: builder.mutation({
      query: (data) => ({ url: "/get-session", method: "GET", params: { sectionKey: data?.sectionKey || "" } }),
    }),
    /////
    sendOtp: builder.mutation({
      query: (data) => ({
        url: "/send-otp",
        method: "POST",
        body: data,
      }),
    }),
    /////
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: "/verify-email",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } = applicantApis;
export default applicantApis;
