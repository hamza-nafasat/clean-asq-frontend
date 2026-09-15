import { LoadScript } from "@react-google-maps/api";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "@/redux/store";
import ErrorBoundary from "@/components/global/ErrorBoundary";
import AIChatWidget from "@/components/shared/aiChat/AIChatWidget";
import getEnv from "@/utils/env";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");

// avoid creating a second root on hot reload
if (!container._reactRoot) {
  const root = createRoot(container);
  container._reactRoot = root;
  root.render(
    <LoadScript googleMapsApiKey={getEnv("GOOGLE_MAPS_API_KEY")} libraries={["places"]}>
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary name="App">
            <App />
          </ErrorBoundary>
          <ErrorBoundary name="AIChatWidget" silent>
            <AIChatWidget />
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </LoadScript>,
  );
}
