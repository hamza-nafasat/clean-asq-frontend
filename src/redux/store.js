import { configureStore } from '@reduxjs/toolkit';
import authApis from './apis/authApis';
import authSlice from './slices/authSlice';
import brandingSlice from './slices/brandingSlice';
import userApis from './apis/userApis';
import roleApis from './apis/roleApis';

const store = configureStore({
  reducer: {
    // reducers
    [authSlice.name]: authSlice.reducer,
    // [userSlice.name]: userSlice.reducer,
    // [roleSlice.name]: roleSlice.reducer,
    [brandingSlice.name]: brandingSlice.reducer,
    // apis
    [authApis.reducerPath]: authApis.reducer,
    [userApis.reducerPath]: userApis.reducer,
    [roleApis.reducerPath]: roleApis.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware({ serializableCheck: false })
      .concat(authApis.middleware)
      .concat(userApis.middleware)
      .concat(roleApis.middleware);
  },
});

export default store;
