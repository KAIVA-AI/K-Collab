import {
  Disposable,
  ProviderResult,
  TextDocumentContentProvider,
  Uri,
  workspace,
  Tab,
  window,
  TabInputTextDiff,
} from 'vscode';

const URI_SCHEME = 'v-collab-memory';

interface MemoryDocument {
  oldContents: string;
  newContents: string;

  originUri: Uri;
  startLine: number;
  endLine: number;
}

export class MemoryFileProvider implements TextDocumentContentProvider {
  private documents: Map<string, MemoryDocument> = new Map();
  private provider?: Disposable;

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    const docId = uri.path;
    const type = uri.query;
    const doc = this.documents.get(docId);
    if (!doc) {
      return null;
    }
    if (type === 'orig') {
      return doc.oldContents;
    }

    return doc.newContents;
  }

  register = (): Disposable => {
    this.provider = workspace.registerTextDocumentContentProvider(
      URI_SCHEME,
      this,
    );
    return this.provider!;
  };

  addDocument = (
    docId: string,
    originUri: Uri,
    oldContents: string,
    newContents: string,
    startLine: number,
    endLine: number,
  ) => {
    this.documents.set(docId, {
      originUri,
      oldContents,
      newContents,
      startLine,
      endLine,
    });
  };

  getDocumentByUri = (uri: Uri): MemoryDocument | null => {
    const docId = uri.path;
    return this.documents.get(docId) || null;
  };

  static getUri = (docId: string, type: 'orig' | 'new') => {
    return Uri.parse(`${URI_SCHEME}:${docId}?${type}`);
  };
  static getOpenedTab = (uri: Uri): Tab | null => {
    const targetUriString = uri.toString();
    const tabGroups = window.tabGroups;
    for (const tabGroup of tabGroups.all) {
      for (const tab of tabGroup.tabs) {
        const tabInput = tab.input;
        if (!(tabInput instanceof TabInputTextDiff)) {
          continue;
        }
        if (tabInput.modified.toString() === targetUriString) {
          return tab;
        }
      }
    }

    return null;
  };
  static closePreviewTabByUri = async (uri: Uri) => {
    const tab = MemoryFileProvider.getOpenedTab(uri);
    if (tab) {
      return window.tabGroups.close(tab);
    }
  };
}
