import { PROJECT_ZULIP_SERVER_CURRENT, PROJECT_ZULIP_SERVER_MAP } from "../constants/chatbox";
import zulipRequestManager from "./request-manage";

async function api(requestUrl: string, config: any, method: any, params?: any) {
  let baseUrl = '';
  let token = '';
  try {
    const workspaceSlug = config.workspaceSlug;
    const projectId = sessionStorage.getItem(PROJECT_ZULIP_SERVER_CURRENT) || "";
    const chatServerMap = JSON.parse(localStorage.getItem(PROJECT_ZULIP_SERVER_MAP) || "{}");

    baseUrl = chatServerMap[workspaceSlug][projectId]?.url;
    token = chatServerMap[workspaceSlug][projectId]?.token;
  } catch (error) { }
  if (!baseUrl) throw "Unable to find zulip server";

  const url = new URL(requestUrl, baseUrl);
  // !todo: update later
  const options: any = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (method === 'POST') {
    options.body = new FormData();
    Object.keys(params).forEach(key => {
      let data = params[key];
      if (Array.isArray(data)) {
        data = JSON.stringify(data);
      }
      options.body.append(key, data);
    });
  } else if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value as string);
    });
  }

  const signal = zulipRequestManager.createAbortController(requestUrl, method);
  const response = await fetch(url.href, {
    signal: signal,
    ...options
  });

  try {
    return await response.json();
  } catch (e: any) {
    if (e.name === "AbortError") {
      console.info("Fetch aborted");
      return;
    }
    if (e instanceof SyntaxError) {
      // We probably got a non-JSON response from the server.
      // We should inform the user of the same.
      let message = 'Server Returned a non-JSON response.';
      if (response.status === 404) {
        message += ` Maybe endpoint: ${method} ${response.url.replace(
          config.apiURL,
          ''
        )} doesn't exist.`;
      } else {
        message += ' Please check the API documentation.';
      }
      const error: any = new Error(message);
      error.res = response;
      return error;
    }
    return e;
  }
}

export default api;
