import { createSlice } from '@reduxjs/toolkit';

const companySlice = createSlice({
  name: 'company',
  initialState: { isApiRunOnce: false, lookupData: null },
  reducers: {
    updateIsApiRunOnce: (state, action) => {
      state.isApiRunOnce = action.payload;
    },
    addLookupData: (state, action) => {
      state.lookupData = action.payload;
    },
  },
});

export const { updateIsApiRunOnce, addLookupData } = companySlice.actions;

export default companySlice;
