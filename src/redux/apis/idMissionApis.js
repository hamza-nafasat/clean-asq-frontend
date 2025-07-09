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
  }),
});
export const { useGetIdMissionSessionMutation } = idMissionApis;
export default idMissionApis;
