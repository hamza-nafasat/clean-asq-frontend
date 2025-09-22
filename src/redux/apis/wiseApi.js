import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getEnv from '@/lib/env';

const wiseApi = createApi({
  reducerPath: 'wiseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getEnv('SERVER_URL')}/api/`,
    credentials: 'include',
  }),
  endpoints: builder => ({
    getBankLookup: builder.query({
      query: searchTerm => `/routing-lookup?searchTerm=${searchTerm}`,
    }),
  }),
});

export const { useGetBankLookupQuery } = wiseApi;
export default wiseApi;
