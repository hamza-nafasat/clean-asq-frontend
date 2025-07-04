import { createSlice } from '@reduxjs/toolkit';

const formSlice = createSlice({
  name: 'form',
  initialState: { formData: {}, fileData: {} },
  reducers: {
    updateFormState: (state, action) => {
      const objKey = action.payload.name;
      const objValue = action.payload.data;
      state.formData[objKey] = objValue;
    },
    updateFileData: (state, action) => {
      state.fileData = action.payload;
    },
  },
});

export const { updateFormState, updateFileData } = formSlice.actions;

export default formSlice;
