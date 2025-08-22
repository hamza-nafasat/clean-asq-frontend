import { createSlice } from '@reduxjs/toolkit';

const companySlice = createSlice({
  name: 'company',
  initialState: { isApiRunOnce: false },
  reducers: {
    updateIsApiRunOnce: (state, action) => {
      state.isApiRunOnce = action.payload;
    },
  },
});

export const { updateIsApiRunOnce } = companySlice.actions;

export default companySlice;
