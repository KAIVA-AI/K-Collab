import React, { useEffect, useState } from "react";
// import logo from "../assets/logo-zulip.svg"; // Import your logo image
// import loading from "../assets/loading.gif";
import "./login.css";
// import * as vscode from 'vscode';
import { ZulipService } from "../services/message";
// Define the props type
interface LoginProps {
    onLoginSuccess: () => void; // Declare the function type
}

// Declare the VSCode Webview API function globally
interface vscode {
  postMessage(message: any): void;
}
declare const vscode: vscode;


export const Login: React.FC<LoginProps> = ({ onLoginSuccess}) => {
    const [accessToken, setAccessToken] = useState<string>('');
    const [realmString, setRealmString] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        // Handle authentication (e.g., make API call)
        // const token = vscode.global?.accessToken;


        if (!accessToken) {
            const zulipService = new ZulipService(realmString, accessToken);
            try {
                // Call handleLogin from ZulipService
                const loginResponse = await zulipService.get_api_key({ "username": username, "password": password});
                console.log("Login successful", loginResponse);
                // Here, you would handle storing the token, redirect, etc.
                // Example: store the token in localStorage or the state management
                vscode.postMessage({
                    command: 'setAuthState',
                    isAuthenticated: true,
                });
            } catch (err) {
                setError('Login failed. Please check your credentials.');
                vscode.postMessage({
                    command: 'setAuthState',
                    isAuthenticated: false,
                });
            }
        } else {
            vscode.postMessage({
                command: 'setAuthState',
                isAuthenticated: true,
            });
        }
        
        

    };

    useEffect(() => {
        // Listen for messages from the VSCode extension (from the webview)
        window.addEventListener('message', (event) => {
          const message = event.data;
    
          if (message.accessToken && message.realmString) {
            setAccessToken(message.accessToken);
            setRealmString(message.realmString);
            console.log("LOGIN PAGE")
            // You can now use the accessToken and realmString to handle login
            console.log('Received accessToken:', message.accessToken);
            console.log('Received realmString:', message.realmString);
    
            // Optionally, call your login handler here with accessToken and realmString
            // handleLogin(message.accessToken, message.realmString);
          }
        });
      }, []);
    
    return (
        <div>
          <h2>Login</h2>
          <input
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          {error && <div>{error}</div>}
        </div>
      );
    // return `
	// 		<body>
    //             <h1>Welcome to Collab!</h1>
    //             <h2>Please login to access our services<h2>
    //             <p class="powered-by">
    //             <em>Powered by VIETIS</em>
    //             </p>

    //             <div class="login-buttons">
    //                 <button id="login-with-zulip" class="login-button zulip">
    //                     <img src=${logo} alt="Cody logo">
    //                     Login with Zulip
    //                 </button>
    //             </div>

    //             <h1>OR</h1>

    //             <div class="login-with-email-and-password}">
    //                 <h2 class="login-email-password-title">Login Zulip with email & password</h2>
    //                 <form class="login-form" action="#" method="post">
    //                     <input type="email" name="email" placeholder="Email" required>
    //                     <input type="password" name="password" placeholder="Password" required>
    //                     <button type="submit">Login</button>
    //                 </form>
    //                 <div id="error-container"></div>
    //             </div>

    //             <div class="loading-overlay" id="loadingOverlay">
    //                 <div class="loading-spinner">
    //                     <img src=${loading} alt="Loading...">
    //                 </div>
    //             </div>          
	// 		</body>
	// 		</html>`;
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
