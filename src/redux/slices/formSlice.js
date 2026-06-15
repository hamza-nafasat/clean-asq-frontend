import { createSlice } from "@reduxjs/toolkit";

const formSlice = createSlice({
  name: "form",
  initialState: {
    formData: {},
    emailVerified: false,
    formHeaderText: "",
    formFooterText: "",
    formHeaderTextSize: 24,
    isDisabledAllFields: true,
  },
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
    updateFormHeaderAndFooter: (state, action) => {
      state.formHeaderText = action.payload.headerText;
      state.formFooterText = action.payload.footerText;
      state.formHeaderTextSize = action.payload.headerTextSize;
    },
    updateIsDisabledAllFields: (state, action) => {
      state.isDisabledAllFields = action.payload;
    },
    clearSavedFormData: (state) => {
      state.formData = {};
    },
  },
});

export const {
  updateFormState,
  updateEmailVerified,
  addSavedFormData,
  updateFormHeaderAndFooter,
  updateIsDisabledAllFields,
  clearSavedFormData,
} = formSlice.actions;

export default formSlice;
