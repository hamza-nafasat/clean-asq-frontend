import { configureStore } from '@reduxjs/toolkit';
import authApis from './apis/authApis';
import authSlice from './slices/authSlice';

const store = configureStore({
  reducer: {
    // reducers
    [authSlice.name]: authSlice.reducer,
    // apis
    [authApis.reducerPath]: authApis.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware({ serializableCheck: false }).concat(authApis.middleware);
  },
});

export default store;
