import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getEnv from "@/utils/env";

const ROLE_TAGS = {
  ROLE: "Role",
  PERMISSION: "Permission",
};

const roleApis = createApi({
  reducerPath: "roleApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${getEnv("SERVER_URL")}/api/role`, credentials: "include" }),
  tagTypes: [ROLE_TAGS.ROLE, ROLE_TAGS.PERMISSION],
  endpoints: (builder) => ({
    /////
    createRole: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [ROLE_TAGS.ROLE],
    }),
    /////
    getAllRoles: builder.query({
      query: () => ({
        url: "/all",
        method: "GET",
      }),
      providesTags: [ROLE_TAGS.ROLE],
    }),
    /////
    updateSingleRole: builder.mutation({
      query: ({ _id, name, permissions }) => ({
        url: `single/${_id}`,
        method: "PUT",
        body: { name, permissions },
      }),
      invalidatesTags: [ROLE_TAGS.ROLE],
    }),
    /////
    deleteSingleRole: builder.mutation({
      query: (data) => ({
        url: `single/${data?._id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ROLE_TAGS.ROLE],
    }),
    /////
    getAllPermissions: builder.query({
      query: () => ({
        url: "/permissions",
        method: "GET",
      }),
      providesTags: [ROLE_TAGS.PERMISSION],
    }),
  }),
});

export const {
  useCreateRoleMutation,
  useGetAllRolesQuery,
  useUpdateSingleRoleMutation,
  useDeleteSingleRoleMutation,
  useGetAllPermissionsQuery,
} = roleApis;

export default roleApis;
