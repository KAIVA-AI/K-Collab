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
    //@ts-ignore
    
    
    const handleLoginSuccess = () => {
        setIsLoggedIn(true); // Switch to chat page after successful login
    };
    console.log("APP REACT")
    useEffect(() => {
        console.log("APP REACT LISTTENSER")
        window.addEventListener('message', event => {
            const message = event.data;
            debugger
  
            if (message.accessToken && message.realmString) {  
              // You can now use the accessToken and realmString to handle login
              console.log('Received accessToken:', message.accessToken);
              console.log('Received realmString:', message.realmString);
              setIsLoggedIn(true)
      
              // Optionally, call your login handler here with accessToken and realmString
              // handleLogin(message.accessToken, message.realmString);
            }
        });
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
      
            if (message.command === "loadChatPage") {
                handleLoginSuccess();
            }
          };
      
          window.addEventListener("message", handleMessage);
    
      }, []);
    return (
        <div>
            {!isLoggedIn ? (
                <Login onLoginSuccess={handleLoginSuccess}/>
                // <ChatPage />
            ) : (
                <ChatPage />
            )}
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);