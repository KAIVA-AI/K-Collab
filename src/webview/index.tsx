import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import { Login } from "./login"
import "./style.css";
import { ChatPage } from "./chat";

function App() {
    // const pageName = window.vietisExtensionPageName;
    // console.log("CHAT !@#!@# ", pageName)
    // if (pageName === "chat") {
    //     return <ChatPage />;
    // }

    // return (<h1>FAIL</h1>);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true); // Switch to chat page after successful login
    };

    return (
        <div>
            {!isLoggedIn ? (
                // <Login onLoginSuccess={handleLoginSuccess} />
                <ChatPage />
            ) : (
                <ChatPage />
            )}
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);