import { window, SnippetString } from 'vscode';

export class InputUtil {
  public static async input(
    prompt: string,
    placeHolder?: string,
  ): Promise<string | undefined> {
    return window.showInputBox({
      prompt: prompt,
      placeHolder: placeHolder,
    });
  }

  public static async applyTextToEditor(text: string) {
    window.activeTextEditor?.insertSnippet(new SnippetString(text));
  }
}
