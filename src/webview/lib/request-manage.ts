class RequestManager {
    private abortControllers: { [key: string]: AbortController; } = {};
  
    private getKey(endpoint: string, method: string): string {
      return `${method.toUpperCase()}:${endpoint}`;
    }
  
    createAbortController(endpoint: string, method: string): AbortSignal {
      const key = this.getKey(endpoint, method);
  
      if (
        this.abortControllers[key] &&
        !this.abortControllers[key].signal.aborted
      ) {
        this.abortControllers[key].abort();
      }
  
      const controller = new AbortController();
      this.abortControllers[key] = controller;
      return controller.signal;
    }
  
    cancelRequest(endpoint: string, method: string): void {
      const key = this.getKey(endpoint, method);
  
      if (this.abortControllers[key]) {
        this.abortControllers[key].abort();
        delete this.abortControllers[key];
      }
    }
  
    cancelAllRequests(): void {
      console.info("canceling all reqs");
      const keys = Object.keys(this.abortControllers);
      keys.forEach((key) => {
        this.abortControllers[key].abort();
        delete this.abortControllers[key];
      });
    }
  }
  
  const zulipRequestManager = new RequestManager();
  export default zulipRequestManager;