import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { HTTP_STATUSES, TOAST_IDS } from "@/constants";
import { sessionCleared } from "@/redux/slices/auth.slice";

// signs out when a signed-in session expires
export const createBaseQuery = (baseUrl) => {
  const baseQuery = fetchBaseQuery({ baseUrl, credentials: "include" });
  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    const isExpired = result.error?.status === HTTP_STATUSES.UNAUTHORIZED && api.getState().auth.user;
    if (isExpired) {
      api.dispatch(sessionCleared());
      toast.error("Your session has expired. Please sign in again.", { toastId: TOAST_IDS.SESSION_EXPIRED });
    }
    return result;
  };
};
