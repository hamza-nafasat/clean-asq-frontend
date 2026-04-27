import getEnv from "@/lib/env";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const userApis = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv("SERVER_URL")}/api/user`, credentials: "include" }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // create new user
    // ---------------
    createUser: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    // get get all users
    // --------------
    getAllUsers: builder.query({
      query: () => ({
        url: "/all",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    // get single user
    // ---------------
    getSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "GET",
      }),
      invalidatesTags: ["Users"],
    }),

    // update single user
    // ---------------
    updateSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    // DELETE single user
    // ---------------
    deleteSingleUser: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "Delete",
      }),
      invalidatesTags: ["Users"],
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
