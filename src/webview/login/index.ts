import React, { useEffect, useState } from "react";
import logo from "../assets/logo-zulip.svg"; // Import your logo image
import loading from "../assets/loading.gif";
import "./login.css";
// Define the props type
interface LoginProps {
    onLoginSuccess: () => void; // Declare the function type
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [accessKey, setAccessKey] = useState("");
    const [isKeyValid, setIsKeyValid] = useState(null);
    //@ts-ignore
    const vscode = acquireVsCodeApi(); // Acquire VSCode API

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Send the access key to the extension for validation
        vscode.postMessage({
            command: "checkAccessKey",
            accessKey: accessKey,
        });
    };

    useEffect(() => {
        window.addEventListener("message", (event) => {
            const message = event.data;
            if (message.command === "accessKeyResult") {
                setIsKeyValid(message.isValid);

                if (message.isValid) {
                    const userData = { username: "JohnDoe", token: "abcdef12345" };
                    vscode.postMessage({
                        command: "storeUserData",
                        userData: userData,
                    });

                    onLoginSuccess(); // Notify parent to switch to chat view
                }
            }
        });

        return () => {
            window.removeEventListener("message", () => {});
        };
    }, []);
    return `
			<body>
                <h1>Welcome to Collab!</h1>
                <h2>Please login to access our services<h2>
                <p class="powered-by">
                <em>Powered by VIETIS</em>
                </p>

                <div class="login-buttons">
                    <button id="login-with-zulip" class="login-button zulip">
                        <img src=${logo} alt="Cody logo">
                        Login with Zulip
                    </button>
                </div>

                <h1>OR</h1>

                <div class="login-with-email-and-password}">
                    <h2 class="login-email-password-title">Login Zulip with email & password</h2>
                    <form class="login-form" action="#" method="post">
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <div id="error-container"></div>
                </div>

                <div class="loading-overlay" id="loadingOverlay">
                    <div class="loading-spinner">
                        <img src=${loading} alt="Loading...">
                    </div>
                </div>          
			</body>
			</html>`;
    // return `
    //     <div>
    //         <h1>Login</h1>
    //         <form onSubmit={handleSubmit}>
    //             <input
    //                 type="text"
    //                 value={accessKey}
    //                 onChange={(e) => setAccessKey(e.target.value)}
    //                 placeholder="Enter Access Key"
    //             />
    //             <button type="submit">Login</button>
    //         </form>

    //         {isKeyValid === true && <p>Access Key is valid!</p>}
    //         {isKeyValid === false && <p>Invalid Access Key, try again.</p>}
    //     </div>
    // `;
};

export default Login;
