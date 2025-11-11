import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import PrivyProviderWrapper from "./providers/PrivyProviderWrapper";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <PrivyProviderWrapper>
        <App />
    </PrivyProviderWrapper>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
