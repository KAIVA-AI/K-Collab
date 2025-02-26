import { OutputChannel, window } from 'vscode';

let outputChannel: OutputChannel | undefined;

export class Logger {
  static register() {
    outputChannel =
      outputChannel ??
      window.createOutputChannel('K-Collab', {
        log: true,
      });
  }
  static log(message: string) {
    console.log(message);
    outputChannel?.appendLine(message);
  }
}
