import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getEnv from "@/utils/env";

const idMissionApis = createApi({
  reducerPath: "idMissionApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv("SERVER_URL")}/api/id-mission`, credentials: "include" }),
  tagTypes: ["idMission"],
  endpoints: (builder) => ({
    /////
    getIdMissionSession: builder.mutation({
      query: (data) => ({
        url: `/get-session?sectionKey=${data?.sectionKey || ""}`,
        method: "GET",
      }),
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

export const { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } = idMissionApis;
export default idMissionApis;
