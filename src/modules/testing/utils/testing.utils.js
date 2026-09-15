import getEnv from "@/utils/env";
import { TESTING_API_PATHS } from "./testing.constants";

const SERVER_URL = getEnv("SERVER_URL");

// call the testing api and return the parsed json
export const fetchTesting = async (path, { method, body } = {}) => {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method,
    credentials: "include",
    ...(body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
  return res.json();
};

// same as fetchTesting but throws when the api reports a failure
export const testingRequest = async (path, { method, body, fallbackMessage } = {}) => {
  const data = await fetchTesting(path, { method, body });
  if (!data.success) throw new Error(data.message || fallbackMessage);
  return data;
};

export const testCasePath = (...segments) => [TESTING_API_PATHS.TEST_CASES, ...segments].join("/");

export const getAreaNames = (testCases) => [...new Set(testCases.map((tc) => tc.area))];

export const getVerificationTableStyles = ({ textColor, secondaryColor, backgroundColor }) => ({
  table: {
    style: {
      border: "1px solid #ccc",
      borderRadius: "0.375rem",
      overflow: "hidden",
    },
  },
  headCells: {
    style: {
      fontSize: "14px",
      fontWeight: 700,
      color: textColor || "#171717",
      backgroundColor: backgroundColor || "transparent",
      borderBottom: "1px solid #ccc",
    },
  },
  rows: {
    style: {
      background: "transparent",
      padding: "10px 0",
      margin: "0",
      borderBottom: "1px dashed #ccc",
    },
  },
  cells: {
    style: {
      color: textColor || "#7E7E7E",
      fontSize: "14px",
    },
  },
  pagination: {
    style: {
      color: textColor || "#171717",
      backgroundColor: backgroundColor || "transparent",
      borderTop: "1px solid #ccc",
    },
    pageButtonsStyle: {
      color: textColor || "#066969",
      fill: `${textColor || "#066969"} !important`,
      "& svg": {
        fill: `${textColor || "#066969"} !important`,
      },
      "&:hover": {
        backgroundColor: secondaryColor,
      },
      "&:disabled": {
        color: "#ccc",
        fill: "#ccc !important",
      },
    },
  },
});
