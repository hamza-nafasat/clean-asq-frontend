import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    userExist: (state, action) => {
      state.user = action.payload;
    },
    userNotExist: state => {
      state.user = null;
    },
  },
});

export const { userExist, userNotExist } = authSlice.actions;

export default authSlice;
