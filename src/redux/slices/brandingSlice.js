import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  companyName: null, // Use descriptive key instead of 'user'
};

const brandingSlice = createSlice({
  name: 'branding',
  initialState,
  reducers: {
    setCompanyName: (state, action) => {
      state.companyName = action.payload;
    },
  },
});

export const { setCompanyName } = brandingSlice.actions;

export default brandingSlice;
