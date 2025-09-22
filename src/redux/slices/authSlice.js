import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, idMissionData: null },
  reducers: {
    userExist: (state, action) => {
      state.user = action.payload;
    },
    userNotExist: state => {
      state.user = null;
    },
    setIdMissionData: (state, action) => {
      state.idMissionData = action.payload;
    },
  },
});

export const { userExist, userNotExist, setIdMissionData } = authSlice.actions;

export default authSlice;
