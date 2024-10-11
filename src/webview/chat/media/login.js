//@ts-ignore

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();
  
    // Add event listeners
    document.getElementById('login-with-zulip').addEventListener('click', loginWithZulip);
    document.getElementById('login-with-google').addEventListener('click', loginWithGoogle);
    document.getElementById('login-with-gitlab').addEventListener('click', loginWithGitlab);
  
    const form = document.querySelector('.login-form');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const loadingSpinner = document.querySelector('.loading-spinner img');
    const errorContainer = document.getElementById('error-container');
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      errorContainer.textContent = '';
  
      loadingOverlay.style.display = 'flex';
      loadingSpinner.style.display = 'block';
  
      const email = emailInput.value;
      const password = passwordInput.value;
  
      if (!email || !password) {
        alert('Please fill in both fields');
        return;
      }
  
      vscode.postMessage({
        loginType: 'emailPassword',
        email: email,
        password: password,
      });
    });
  
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.status === 'login-completed') {
        loadingOverlay.style.display = 'none';
        loadingSpinner.style.display = 'none';
        if (!message.isSuccess && message.errorMessage) {
          errorContainer.textContent = message.errorMessage;
        }
      }
    });
  
    // Define handler functions
    function loginWithZulip() {
      vscode.postMessage({ loginType: 'zulip' });
    }
  
    function loginWithGoogle() {
      vscode.postMessage({ loginType: 'google' });
    }
  
    function loginWithGitlab() {
      vscode.postMessage({ loginType: 'gitlab' });
    }
  }());
  
  
  