import { createSlice } from "@reduxjs/toolkit";

const formSlice = createSlice({
  name: "form",
  initialState: {
    formData: {},
    currentDraftId: null,
    currentDraftFormId: null,
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
    // the draft id only counts for its own form
    setCurrentDraftId: (state, action) => {
      state.currentDraftId = action.payload?.draftId || null;
      state.currentDraftFormId = action.payload?.formId || null;
    },
    updateFormHeaderAndFooter: (state, action) => {
      state.formHeaderText = action.payload.headerText;
      state.formFooterText = action.payload.footerText;
      state.formHeaderTextSize = action.payload.headerTextSize;
    },
    updateIsDisabledAllFields: (state, action) => {
      state.isDisabledAllFields = action.payload;
    },
    // a new application verifies its email again
    resetApplicationProgress: (state) => {
      state.formData = {};
      state.currentDraftId = null;
      state.currentDraftFormId = null;
      state.emailVerified = false;
    },
  },
});

export const {
  updateFormState,
  updateEmailVerified,
  addSavedFormData,
  setCurrentDraftId,
  updateFormHeaderAndFooter,
  updateIsDisabledAllFields,
  resetApplicationProgress,
} = formSlice.actions;

export default formSlice;
