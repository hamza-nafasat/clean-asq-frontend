import { combineReducers, configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import applicantApis from "@/redux/apis/applicant.apis";
import authApis from "@/redux/apis/auth.apis";
import brandingApis from "@/redux/apis/branding.apis";
import emailApis from "@/redux/apis/email.apis";
import formApis from "@/redux/apis/form.apis";
import roleManagementApis from "@/redux/apis/roleManagement.apis";
import userManagementApis from "@/redux/apis/userManagement.apis";
import aiChatSlice from "@/redux/slices/aiChat.slice";
import authSlice, { sessionCleared } from "@/redux/slices/auth.slice";
import brandingSlice from "@/redux/slices/branding.slice";
import companySlice from "@/redux/slices/company.slice";
import formSlice from "@/redux/slices/form.slice";

const APIS = [authApis, userManagementApis, roleManagementApis, formApis, applicantApis, brandingApis, emailApis];

const appReducer = combineReducers({
  // slices
  [authSlice.name]: authSlice.reducer,
  [brandingSlice.name]: brandingSlice.reducer,
  [formSlice.name]: formSlice.reducer,
  [companySlice.name]: companySlice.reducer,
  [aiChatSlice.name]: aiChatSlice.reducer,

  // apis
  ...Object.fromEntries(APIS.map((api) => [api.reducerPath, api.reducer])),
});

// sign-out keeps only the theme
const rootReducer = (state, action) =>
  appReducer(sessionCleared.match(action) ? { [brandingSlice.name]: state?.[brandingSlice.name] } : state, action);

// sign-out also empties every api cache
const sessionListener = createListenerMiddleware();
sessionListener.startListening({
  actionCreator: sessionCleared,
  effect: (_, listenerApi) => APIS.forEach((api) => listenerApi.dispatch(api.util.resetApiState())),
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .prepend(sessionListener.middleware)
      .concat(APIS.map((api) => api.middleware)),
});

export default store;
