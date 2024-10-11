import * as React from "react";
import { createRoot } from "react-dom/client";

import "./style.css";
import { ChatPage } from "./chat";

function App() {
    const pageName = window.vietisExtensionPageName;

    if (pageName === "chat") {
        return <ChatPage />;
    }

    return null;
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);