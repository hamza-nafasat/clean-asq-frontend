import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    userExist: (state, action) => {
      state.user = action.payload;
    },
    userNotExist: state => {
      state.user = null;
    },
    // store.js clears the rest of the session
    sessionCleared: state => {
      state.user = null;
    },
  },
});

export const { userExist, userNotExist, sessionCleared } = authSlice.actions;

export default authSlice;
