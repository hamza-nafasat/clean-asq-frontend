import { configureStore } from '@reduxjs/toolkit';
import authApis from './apis/authApis';
import authSlice from './slices/authSlice';
import brandingSlice from './slices/brandingSlice';
import userApis from './apis/userApis';
import roleApis from './apis/roleApis';
import formApis from './apis/formApis';
import formSlice from './slices/formSlice';
import idMissionApis from './apis/idMissionApis';
import brandingApis from './apis/brandingApis';
import companySlice from './slices/companySlice';

const store = configureStore({
  reducer: {
    // reducers
    [authSlice.name]: authSlice.reducer,
    // [userSlice.name]: userSlice.reducer,
    // [roleSlice.name]: roleSlice.reducer,
    [brandingSlice.name]: brandingSlice.reducer,
    [formSlice.name]: formSlice.reducer,
    [companySlice.name]: companySlice.reducer,
    // apis
    [authApis.reducerPath]: authApis.reducer,
    [userApis.reducerPath]: userApis.reducer,
    [roleApis.reducerPath]: roleApis.reducer,
    [formApis.reducerPath]: formApis.reducer,
    [idMissionApis.reducerPath]: idMissionApis.reducer,
    [brandingApis.reducerPath]: brandingApis.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware({ serializableCheck: false })
      .concat(authApis.middleware)
      .concat(userApis.middleware)
      .concat(roleApis.middleware)
      .concat(formApis.middleware)
      .concat(idMissionApis.middleware)
      .concat(brandingApis.middleware);
  },
});

export default store;
