import { LoadScript } from "@react-google-maps/api";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { io } from "socket.io-client";
import App from "./App";
import { AIChatProvider } from "./context/AiChatContext";
import { BrandingProvider } from "./hooks/BrandingContext";
import "./index.css";
import getEnv from "./lib/env";
import store from "./redux/store";

export const socket = io(getEnv("SERVER_URL"), {
  path: "/api/socket.io",
  withCredentials: true,
});

const container = document.getElementById("root");

// Avoid creating multiple roots
if (!container._reactRoot) {
  const root = createRoot(container);
  container._reactRoot = root;
  root.render(
    // <StrictMode>
    <LoadScript googleMapsApiKey={getEnv("GOOGLE_MAPS_API_KEY")} libraries={["places"]}>
      <BrandingProvider>
        <Provider store={store}>
          <AIChatProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AIChatProvider>
        </Provider>
      </BrandingProvider>
    </LoadScript>,
    // </StrictMode>
  );
}
