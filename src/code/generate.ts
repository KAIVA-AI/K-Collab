import * as vscode from "vscode";
import { generateCode } from "../utils/code";
import Manager from "../manager";

// TODO implement settings
const limitBefore = 50;
const limitAfter = 50;

export const completeOnDemand = async (manager: Manager) => {
  const contextMessage = getPromtWithContextMessage();
  if (!!contextMessage) {
    return await generateCode(contextMessage, manager);
  }
};

export const getPromtWithContextMessage = (): string => {
  const { textSelect, textBefore, textAfter } = getContextMessage();
  const contextMessage = makeCodePrompt(textSelect, textBefore, textAfter);
  return contextMessage;
}

export const wrapCodeContext = (): string => {
  const textSelect = getSelectedMessage();
  if (!textSelect) {
    return '';
  }
  return `\`\`\`
  ${textSelect}
  \`\`\``;
}

export const makeCodePrompt = (textSelect: string, textBefore: string, textAfter: string) => `\`\`\`
${textBefore}
<v-collab-complete></v-collab-complete>
${textAfter}
\`\`\``;


export const getContextMessage = (): any => {
  const editors = vscode.window.visibleTextEditors;

  if (!editors || editors.length === 0) {
    return {
      textSelect: '',
      textBefore: '',
      textAfter: '',
    };
  }
  const editor = vscode.window.activeTextEditor || editors[0];
  let textSelect = '';
  let textBefore = '';
  let textAfter = '';
  if (editor) {
    const document = editor.document;
    const select = editor.selection;
    if (editor.selection.isEmpty) {
      const position = editor.selection.active;
      textBefore = document.getText(
        new vscode.Range(position.with(Math.max(position.line - limitBefore, 0), 0), position)
      );
      textAfter = document.getText(
        new vscode.Range(position, position.with(position.line + limitAfter, Infinity))
      );
    } else {
      textSelect = document.getText(select);
      textBefore = document.getText(select); // TODO get text before and after of selection
    }
  }
  return { textSelect, textBefore, textAfter };
}

export const getSelectedMessage = (): any => {
  const editors = vscode.window.visibleTextEditors;

  if (!editors || editors.length === 0) {
    return ''
  }
  const editor = vscode.window.activeTextEditor || editors[0];
  if (editor) {
    const document = editor.document;
    const select = editor.selection;
    if (!editor.selection.isEmpty) {
      return document.getText(select);
    }
  }
  return '';
}

