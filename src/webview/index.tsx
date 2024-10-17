import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import { Login } from "./login"
import "./style.css";
import { ChatPage } from "./chat";
import ChatTopicList from '../webview/chat/chat-topic';
import {IListTopic} from './constants/chatbox';

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
    // declare list topic
    const [selectedTopic, setSelectedTopic] = useState<IListTopic | null>(null);

    const topics: IListTopic[] = [
        { name: "Channel Interface Declaration in Constants File", timestamp: "2d ago" },
        { name: "Resolving EventSource Type Error in TypeScript", timestamp: "5d ago" },
        { name: "Define or import the 'Messages' type.", timestamp: "5d ago" },
        { name: "New chat", timestamp: "6d ago" },
        { name: "Importing the IManager Interface to Fix Error", timestamp: "1w ago" },
        { name: "Fixing TypeScript Module Export Error", timestamp: "1w ago" }
        // ...more topics
    ];
    
    const handleSelectTopic = (topic: IListTopic) => {
        console.log("Selected topic:", topic);
    };
    
    const handleEditTopic = (topic: IListTopic) => {
        console.log("Edit topic:", topic);
    };
    
    const handleDeleteTopic = (topic: IListTopic) => {
        console.log("Delete topic:", topic);
    };


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