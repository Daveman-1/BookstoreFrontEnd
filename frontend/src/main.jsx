import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SettingsProvider } from "./context/SettingsContext";
import "./index.css";

// Error boundary for development
const ErrorFallback = ({ error }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Something went wrong:</h1>
    <pre style={{ color: 'red' }}>{error.message}</pre>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
