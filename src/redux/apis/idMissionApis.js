import getEnv from '@/lib/env';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const idMissionApis = createApi({
  reducerPath: 'idMissionApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv('SERVER_URL')}/api/id-mission`, credentials: 'include' }),

  tagTypes: ['idMission'],
  endpoints: builder => ({
    // get session
    // --------------
    getIdMissionSession: builder.mutation({
      query: () => ({
        url: '/get-session',
        method: 'GET',
      }),
    }),
    // send otp
    // --------------
    sendOtp: builder.mutation({
      query: data => ({
        url: '/send-otp',
        method: 'POST',
        body: data,
      }),
    }),
    // verify email
    // --------------
    verifyEmail: builder.mutation({
      query: data => ({
        url: '/verify-email',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});
export const { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } = idMissionApis;
export default idMissionApis;
