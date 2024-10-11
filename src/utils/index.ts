import * as vscode from "vscode";
import * as os from "os";
import path = require('path');

import {
  VSCodeCommands,
  EXTENSION_ID,
  VSLS_EXTENSION_PACK_ID,
  VSLS_EXTENSION_ID,
  VSLS_SPACES_EXTENSION_ID,
  ROOT_ZULIP_REALM,
  DEFAULT_BOT_IMAGE
} from "../constants";

export const openUrl = (url: string) => {
  const parsedUrl = vscode.Uri.parse(url);
  return vscode.commands.executeCommand(VSCodeCommands.OPEN, parsedUrl);
};

export const openSettings = () => {
  vscode.commands.executeCommand(VSCodeCommands.OPEN_SETTINGS);
};

export const getVsContext = (name: string) => {
  return vscode.commands.getCommands();
};

export const setVsContext = (name: string, value: boolean) => {
  return vscode.commands.executeCommand("setContext", name, value);
};

export const getExtension = (
  extensionId: string
): vscode.Extension<any> | undefined => {
  return vscode.extensions.getExtension(extensionId);
};

export interface Versions {
  os: string;
  extension: string;
  editor: string;
}

export const getExtensionVersion = (): string => {
  const extension = getExtension(EXTENSION_ID);
  return !!extension ? extension.packageJSON.version : undefined;
};

export const getVersions = (): Versions => {
  return {
    os: `${os.type()} ${os.arch()} ${os.release()}`,
    extension: getExtensionVersion(),
    editor: vscode.version
  };
};

export const hasVslsExtensionPack = (): boolean => {
  return !!getExtension(VSLS_EXTENSION_PACK_ID);
};

export const hasVslsExtension = (): boolean => {
  return !!getExtension(VSLS_EXTENSION_ID);
};

export const hasVslsSpacesExtension = (): boolean => {
  return !!getExtension(VSLS_SPACES_EXTENSION_ID);
}

export const sanitiseTokenString = (token: string) => {
  const trimmed = token.trim();
  const sansQuotes = trimmed.replace(/['"]+/g, "");
  return sansQuotes;
};

export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isSuperset(set: Set<any>, subset: Set<any>): boolean {
  for (var elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
}

export function difference(setA: Set<any>, setB: Set<any>) {
  var _difference = new Set(setA);
  for (var elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

export function equals(setA: Set<any>, setB: Set<any>) {
  if (setA.size !== setB.size) {
    return false;
  }

  for (var a of setA) {
    if (!setB.has(a)) {
      return false;
    }
  }

  return true;
}

// User-defined type guard
// https://github.com/Microsoft/TypeScript/issues/20707#issuecomment-351874491
export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function toDateString(date: Date) {
  // Returns ISO-format date string for a given date
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();

  if (month.length === 1) {
    month = `0${month}`;
  }

  if (day.length === 1) {
    day = `0${day}`;
  }

  return `${date.getFullYear()}-${month}-${day}`;
}

export function camelCaseToTitle(text: string) {
  var result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function titleCaseToCamel(text: string) {
  var result = text.replace(/ /g, "");
  return result.charAt(0).toLowerCase() + result.slice(1);
}

export const getResourceUrl = (resourcePath: string): string => {
  if (!resourcePath) {
    return DEFAULT_BOT_IMAGE;
  }

  if (resourcePath.startsWith("http")) {
    return resourcePath;
  }
  return `${ROOT_ZULIP_REALM}${resourcePath}`;
};

export const joinPath = (uri: vscode.Uri, ...pathFragment: string[]): vscode.Uri => {
  // Reimplementation of
  // https://github.com/microsoft/vscode/blob/b251bd952b84a3bdf68dad0141c37137dac55d64/src/vs/base/common/uri.ts#L346-L357
  // with Node.JS path. This is a temporary workaround for https://github.com/eclipse-theia/theia/issues/8752.
  if (!uri.path) {
    throw new Error('[UriError]: cannot call joinPaths on URI without path');
  }
  return uri.with({ path: vscode.Uri.file(path.join(uri.fsPath, ...pathFragment)).path });
}

export const getNonce = () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Gets the direct recipient IDs from the given recipients array.
 * 
 * Maps over the recipients to get their IDs, sorts the IDs, joins 
 * them into a comma-separated string, and prefixes with 'im_'.
 * 
 * @param recipients - Array of recipient objects 
 * @returns Comma-separated string of sorted recipient IDs prefixed with 'im_'
 */
export const getDirectRecipientIds = (recipients: any) => {
  const ids = recipients.map((recipient: any) => recipient.id)
    .sort()
    .join(',');
  return 'im_' + ids;
}

/**
 * Extracts the private stream ID from a channel ID string.
 * 
 * The channel ID is expected to have the format 'streamId_channelName'.
 * This function uses a regex to extract the numeric streamId.
 * 
 * @param channelId - The channel ID string 
 * @returns The numeric streamId, or undefined if no match
 */
export const getPrivateAIStreamId = (channelId: string): number | undefined => {
  // Using a regular expression to extract private streamId
  const match = channelId.match(/^(.*?)_/);
  if (!match) {
    return;
  }
  return parseInt(match[1]);
}

