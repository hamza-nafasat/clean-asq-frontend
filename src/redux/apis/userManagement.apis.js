import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getEnv from "@/utils/env";

const USER_TAGS = {
  USERS: "Users",
};

const userApis = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv("SERVER_URL")}/api/user`, credentials: "include" }),
  tagTypes: [USER_TAGS.USERS],
  endpoints: (builder) => ({
    /////
    createUser: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [USER_TAGS.USERS],
    }),
    /////
    getAllUsers: builder.query({
      query: () => ({
        url: "/all",
        method: "GET",
      }),
      providesTags: [USER_TAGS.USERS],
    }),
    /////
    getSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "GET",
      }),
      invalidatesTags: [USER_TAGS.USERS],
    }),
    /////
    updateSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [USER_TAGS.USERS],
    }),
    /////
    deleteSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "Delete",
      }),
      invalidatesTags: [USER_TAGS.USERS],
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
