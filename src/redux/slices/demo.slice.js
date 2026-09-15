import { createSlice } from "@reduxjs/toolkit";
import { DEMO_SESSION_STATUSES } from "@/modules/demo/utils/demo.constants";

const initialState = {
  session: null,
  sessionStatus: null,
  currentIndex: 0,
  currentStep: null,
  narration: "",
  currentDemoAction: null,
  questions: [],
  viewerCount: 0,
  scriptSteps: [],
};

const demoSlice = createSlice({
  name: "demo",
  initialState,
  reducers: {
    sessionStarted: (state, action) => {
      state.session = action.payload;
      state.sessionStatus = DEMO_SESSION_STATUSES.GENERATING;
      state.currentIndex = 0;
      state.narration = "";
      state.currentStep = null;
      state.questions = [];
      state.scriptSteps = [];
    },
    sessionReady: (state, action) => {
      if (action.payload?.length) state.scriptSteps = action.payload;
      state.sessionStatus = DEMO_SESSION_STATUSES.READY;
    },
    readyIfStillGenerating: (state) => {
      if (state.sessionStatus === DEMO_SESSION_STATUSES.GENERATING) state.sessionStatus = DEMO_SESSION_STATUSES.READY;
    },
    stepChanged: (state, action) => {
      state.currentIndex = action.payload.currentIndex;
      state.currentStep = action.payload.step;
      state.sessionStatus = action.payload.status;
    },
    narrationReceived: (state, action) => {
      state.narration = action.payload.narration || "";
      state.currentDemoAction = action.payload.demoAction || null;
    },
    questionReceived: (state, action) => {
      state.questions.push({ from: action.payload.from, question: action.payload.question, answer: null });
    },
    questionAnswered: (state, action) => {
      state.questions = state.questions.map((item) =>
        item.question === action.payload.question && item.answer === null
          ? { ...item, answer: action.payload.answer }
          : item,
      );
    },
    setSessionStatus: (state, action) => {
      state.sessionStatus = action.payload;
    },
    setViewerCount: (state, action) => {
      state.viewerCount = action.payload;
    },
    demoFinished: (state) => {
      state.sessionStatus = DEMO_SESSION_STATUSES.ENDED;
      state.currentDemoAction = null;
    },
    sessionCleared: (state) => {
      state.session = null;
      state.sessionStatus = null;
      state.currentStep = null;
      state.narration = "";
      state.currentDemoAction = null;
      state.questions = [];
      state.scriptSteps = [];
    },
  },
});

export const {
  sessionStarted,
  sessionReady,
  readyIfStillGenerating,
  stepChanged,
  narrationReceived,
  questionReceived,
  questionAnswered,
  setSessionStatus,
  setViewerCount,
  demoFinished,
  sessionCleared,
} = demoSlice.actions;

export default demoSlice;
