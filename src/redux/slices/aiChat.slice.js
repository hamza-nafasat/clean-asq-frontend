import { createSlice } from "@reduxjs/toolkit";
import { AI_ASSISTANT_MODES } from "@/constants";

const initialState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  currentScreenId: null,
  formDataSignal: 0,
  widgetResetSignal: 0,
  assistantMode: AI_ASSISTANT_MODES.SERVICE_PROVIDER,
  fieldChangeSignal: 0,
};

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    setIsOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAssistantMode: (state, action) => {
      state.assistantMode = action.payload;
    },
    setCurrentScreenId: (state, action) => {
      state.currentScreenId = action.payload;
    },
    addMessage: {
      reducer: (state, action) => {
        state.messages.push(action.payload);
      },
      prepare: (message) => ({ payload: { ...message, id: Date.now() + Math.random() } }),
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    resetSession: (state) => {
      state.messages = [];
      state.widgetResetSignal += 1;
    },
    bumpFormDataSignal: (state) => {
      state.formDataSignal += 1;
    },
    bumpFieldChangeSignal: (state) => {
      state.fieldChangeSignal += 1;
    },
  },
});

export const {
  setIsOpen,
  setIsLoading,
  setAssistantMode,
  setCurrentScreenId,
  addMessage,
  clearMessages,
  resetSession,
  bumpFormDataSignal,
  bumpFieldChangeSignal,
} = aiChatSlice.actions;

export default aiChatSlice;
