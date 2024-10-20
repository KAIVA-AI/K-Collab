declare module '*.svg' {
  const content: any;
  export default content;
}
declare module '*.gif' {
  const content: any;
  export default content;
}

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

export interface Window {
  acquireVsCodeApi: typeof acquireVsCodeApi;
}
