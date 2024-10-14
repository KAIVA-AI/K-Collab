declare global {
    interface Window {
        get vietisExtensionPageName(): string;
    }
}
declare function acquireVsCodeApi(): {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
};

interface Window {
    acquireVsCodeApi: typeof acquireVsCodeApi;
}

export {};
