import { createSlice } from '@reduxjs/toolkit';

const formSlice = createSlice({
  name: 'form',
  initialState: { formData: {}, emailVerified: false },
  reducers: {
    updateFormState: (state, action) => {
      const objKey = action.payload.name;
      const objValue = action.payload.data;
      state.formData[objKey] = objValue;
    },
    updateEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
    },
    addSavedFormData: (state, action) => {
      state.formData = action.payload;
    },
  },
});

export const { updateFormState, updateEmailVerified, addSavedFormData } = formSlice.actions;

export default formSlice;
