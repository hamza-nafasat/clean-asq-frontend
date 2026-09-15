import { configureStore } from "@reduxjs/toolkit";
import applicantApis from "@/redux/apis/applicant.apis";
import authApis from "@/redux/apis/auth.apis";
import brandingApis from "@/redux/apis/branding.apis";
import emailApis from "@/redux/apis/email.apis";
import formApis from "@/redux/apis/form.apis";
import roleManagementApis from "@/redux/apis/roleManagement.apis";
import userManagementApis from "@/redux/apis/userManagement.apis";
import aiChatSlice from "@/redux/slices/aiChat.slice";
import authSlice from "@/redux/slices/auth.slice";
import brandingSlice from "@/redux/slices/branding.slice";
import companySlice from "@/redux/slices/company.slice";
import demoSlice from "@/redux/slices/demo.slice";
import formSlice from "@/redux/slices/form.slice";

const store = configureStore({
  reducer: {
    // slices
    [authSlice.name]: authSlice.reducer,
    [brandingSlice.name]: brandingSlice.reducer,
    [formSlice.name]: formSlice.reducer,
    [companySlice.name]: companySlice.reducer,
    [aiChatSlice.name]: aiChatSlice.reducer,
    [demoSlice.name]: demoSlice.reducer,

    // apis
    [authApis.reducerPath]: authApis.reducer,
    [userManagementApis.reducerPath]: userManagementApis.reducer,
    [roleManagementApis.reducerPath]: roleManagementApis.reducer,
    [formApis.reducerPath]: formApis.reducer,
    [applicantApis.reducerPath]: applicantApis.reducer,
    [brandingApis.reducerPath]: brandingApis.reducer,
    [emailApis.reducerPath]: emailApis.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authApis.middleware)
      .concat(userManagementApis.middleware)
      .concat(roleManagementApis.middleware)
      .concat(formApis.middleware)
      .concat(applicantApis.middleware)
      .concat(brandingApis.middleware)
      .concat(emailApis.middleware),
});

export default store;
