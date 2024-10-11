import * as vscode from 'vscode';

export class LocalStorage implements vscode.SecretStorage {
    private static instance: LocalStorage | null = null;

    private constructor() {
        // private constructor to prevent instantiation outside the class
        this.onDidChange = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event;
    }

    static getInstance(): LocalStorage {
        // create a single instance if it doesn't exist, or return the existing one
        if (!LocalStorage.instance) {
            LocalStorage.instance = new LocalStorage();
        }
        return LocalStorage.instance;
    }

    get(key: string): Thenable<string | undefined> {
        // implementation for get method
        // You need to replace this with your actual implementation
        return Promise.resolve(undefined);
    }

    store(key: string, value: string): Thenable<void> {
        // implementation for store method
        // You need to replace this with your actual implementation
        return Promise.resolve();
    }

    delete(key: string): Thenable<void> {
        // implementation for delete method
        // You need to replace this with your actual implementation
        return Promise.resolve();
    }

    onDidChange: vscode.Event<vscode.SecretStorageChangeEvent>;
}


