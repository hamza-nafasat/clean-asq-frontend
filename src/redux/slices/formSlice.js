import { createSlice } from '@reduxjs/toolkit';

const formSlice = createSlice({
  name: 'form',
  initialState: { formData: {}, fileData: {}, emailVerified: false },
  reducers: {
    updateFormState: (state, action) => {
      const objKey = action.payload.name;
      const objValue = action.payload.data;
      state.formData[objKey] = objValue;
    },
    updateFileData: (state, action) => {
      state.fileData = action.payload;
    },
    updateEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
    },
    addSavedFormData: (state, action) => {
      state.formData = action.payload;
    },
  },
});

export const { updateFormState, updateFileData, updateEmailVerified, addSavedFormData } = formSlice.actions;

export default formSlice;
