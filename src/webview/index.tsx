import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import { Login } from "./login"
import "./style.css";
import { ChatPage } from "./chat";
import ChatTopicList from '../webview/chat/chat-topic';
import { IListTopic } from './constants/chatbox';
import ZulipStore from './store'

declare function acquireVsCodeApi(): {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
};

function App() {
    console.log("INIT APP");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    //@ts-ignore

    const handleLoginSuccess = () => {
        setIsLoggedIn(true); // Switch to chat page after successful login
    };
    // declare list topic
    const [selectedTopic, setSelectedTopic] = useState<IListTopic | null>(null);
    const [topics, setTopics] = useState<IListTopic[]>([]);

    // setTopics([
    //     { name: "Channel Interface Declaration in Constants File", timestamp: "2d ago" },
    //     { name: "Resolving EventSource Type Error in TypeScript", timestamp: "5d ago" },
    //     { name: "Define or import the 'Messages' type.", timestamp: "5d ago" },
    //     { name: "New chat", timestamp: "6d ago" },
    //     { name: "Importing the IManager Interface to Fix Error", timestamp: "1w ago" },
    //     { name: "Fixing TypeScript Module Export Error", timestamp: "1w ago" }
    //     // ...more topics
    // ]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            console.log("APP REACT LISTENER step3");

            if (message.command === "loadChatPage") {
                // handleLoginSuccess();
                console.log('Received accessToken:', message.accessToken);
                console.log('Received realmString:', message.realmString);
                // Set the login state
                setIsLoggedIn(true);
                // setToken(message.accessToken);
                // setRealm(message.realmString);
            }

            //     // Check for accessToken and realmString
            //     // if (message.accessToken && message.realmString) {  
            //     //     console.log('Received accessToken:', message.accessToken);
            //     //     console.log('Received realmString:', message.realmString);

            //     //     // Set the login state
            //     //     setIsLoggedIn(true);
            //     //     setToken(message.accessToken);
            //     //     setRealm(message.realmString);
            //     // }

            //     // Handle message for loading the chat page

        };

        // Add the event listener
        // window.addEventListener('message', handleMessage);

        console.log("APP REACT LISTTENSER step1")
        // getData()

        window.addEventListener('message', event => {
            const message = event.data;
            console.log("APP REACT LISTTENSER step2 ", message)

            if (message.command === "loadChatPage") {
                // You can now use the accessToken and realmString to handle login
                console.log('Received accessToken:', message.realm);
                console.log('Received realmString:', message.token);

                setIsLoggedIn(true)
                console.log("LOAD ZULIP STORE ", isLoggedIn)
                const zulipStore = new ZulipStore(message.realm, message.token);
                // After login success
                zulipStore.initialize().then(() => {
                    // Navigate to ChatTopicList after initialization
                    console.log("STREAM LOAD ", zulipStore.streams)
                    console.log("STREAM select ", zulipStore.selectedStream)
                    console.log("TOPIC LOAD ", zulipStore.topics)
                    setTopics(zulipStore.topics)
                });
                // setToken(message.accessToken)
                // setRealm(message.realmString)
                // Optionally, call your login handler here with accessToken and realmString
                // handleLogin(message.accessToken, message.realmString);
            }
        });

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            console.log("REMOVE DONE FROM APP REACT");
            window.removeEventListener('message', handleMessage);
        };

    }, []); // Empty array to ensure this effect runs only on component mount

    // async function getData() {
    //     console.log("EXAMPLE CALL API")
    //     const url = "https://pjd-1.collab.vietis.com.vn:9981/api/v1/streams";
    //     try {
    //         const response = await fetch(url, {
    //             method: 'GET',
    //             // credentials: 'include',
    //             headers: {
    //                 'Authorization': 'Basic aGFvLm5ndXllbmRhbmdAdmlldGlzLmNvbS52bjpTWUpxamw3VE12MnJSTENWNGFWMVBmbUtmOUNHcVhKaA== ',
    //                 // 'Content-Type': 'application/json'
    //             }});
    //         if (!response.ok) {
    //             throw new Error(`Response status: ${response.status}`);
    //         }

    //         const json = await response.json();
    //         console.log(json);
    //     } catch (error: any) {
    //         console.error(error.message);
    //     }
    // }


    const handleSelectTopic = (topic: IListTopic) => {
        console.log("Selected topic:", topic);
        setSelectedTopic(topic)
    };

    const handleEditTopic = (topic: IListTopic) => {
        console.log("Edit topic:", topic);
    };

    const handleDeleteTopic = (topic: IListTopic) => {
        console.log("Delete topic:", topic);
    };

    console.log("CHECK STATUS PAGE login", isLoggedIn, "selectedTopic ", selectedTopic)

    // useEffect(() => {
    //     console.log("APP REACT LISTTENSER step1")
    //     window.addEventListener('message', event => {
    //         const message = event.data;
    //         console.log("APP REACT LISTTENSER step2")

    //         if (message.accessToken && message.realmString) {
    //             // You can now use the accessToken and realmString to handle login
    //             console.log('Received accessToken:', message.accessToken);
    //             console.log('Received realmString:', message.realmString);
    //             setIsLoggedIn(true)

    //             setToken(message.accessToken)
    //             setRealm(message.realmString)
    //             // Optionally, call your login handler here with accessToken and realmString
    //             // handleLogin(message.accessToken, message.realmString);
    //         }
    //     });
    //     // send message to extension
        // const handleMessage = (event: MessageEvent) => {
    //         const message = event.data;

    //         if (message.command === "loadChatPage") {
    //             handleLoginSuccess();
    //         }
    //     };

    //     window.addEventListener("message", handleMessage);


    //     // fetchTopics();
    // if (isLoggedIn) {
    //     const zulipStore = new ZulipStore("pjd-1", "aGFvLm5ndXllbmRhbmdAdmlldGlzLmNvbS52bjpTWUpxamw3VE12MnJSTENWNGFWMVBmbUtmOUNHcVhKaA==");
    //     // After login success
    //     zulipStore.initialize().then(() => {
    //         // Navigate to ChatTopicList after initialization
    //         console.log("STREAM LOAD ", zulipStore.streams)
    //         console.log("STREAM select ", zulipStore.selectedStream)
    //         console.log("TOPIC LOAD ", zulipStore.topics)
    //         setTopics(zulipStore.topics)
    //     });
    // }

    // }, []);
    // const vscode = acquireVsCodeApi();
    // console.log("post messge", realm, token)



    //Trigger logic after login
    // useEffect(() => {
    //     if (isLoggedIn) {
    //         console.log('Initializing Zulip store...');

    //         const zulipStore = new ZulipStore(realm, token);

    //         zulipStore.initialize().then(() => {
    //             // After initialization
    //             console.log("STREAM LOAD ", zulipStore.streams);
    //             console.log("STREAM select ", zulipStore.selectedStream);
    //             console.log("TOPIC LOAD ", zulipStore.topics);

    //             // Set the topics
    //             setTopics(zulipStore.topics);
    //         }).catch(err => {
    //             console.error('Error initializing ZulipStore:', err);
    //         });
    //     }
    // }, [isLoggedIn]);  // Only re-run when these values change


    return (
        <div>
            {!isLoggedIn ? (
                <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
                <>
                    {!selectedTopic ? (
                        <ChatTopicList topics={topics} onSelectTopic={handleSelectTopic} onEditTopic={handleEditTopic} onDeleteTopic={handleDeleteTopic} />
                    ) : (
                        <ChatPage topic={selectedTopic} />
                    )}
                </>
            )}
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);