import * as React from "react";
import { createRoot } from "react-dom/client";

import "./style.css";
import { ChatPage } from "./chat";

function App() {
    const pageName = window.vietisExtensionPageName;
    console.log("CHAT !@#!@# ", pageName)
    if (pageName === "chat") {
        return <ChatPage />;
    }

    return <ChatPage />;
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);