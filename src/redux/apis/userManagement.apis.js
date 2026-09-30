import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "@/redux/store.utils";
import { API_TAGS } from "@/constants";
import getEnv from "@/utils/env";

const userApis = createApi({
  reducerPath: "userApi",
  baseQuery: createBaseQuery(`${getEnv("SERVER_URL")}/api/user`),
  tagTypes: [API_TAGS.USERS],
  endpoints: (builder) => ({
    /////
    createUser: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [API_TAGS.USERS],
    }),
    /////
    getAllUsers: builder.query({
      query: () => ({
        url: "/all",
        method: "GET",
      }),
      providesTags: [API_TAGS.USERS],
    }),
    /////
    updateSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [API_TAGS.USERS],
    }),
    /////
    deleteSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.USERS],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useUpdateSingleUserMutation,
  useDeleteSingleUserMutation,
} = userApis;

export default userApis;
