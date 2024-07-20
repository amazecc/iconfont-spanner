import React from "react";
import ReactDOM from "react-dom/client";
import "./globals.css";

const App = () => {
    return (
        <div>
            <h1>webpack 案例</h1>
            <h2 className="text-blue-500">tailwindcss</h2>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
