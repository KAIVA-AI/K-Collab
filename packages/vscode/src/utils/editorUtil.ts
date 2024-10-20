import {
  Disposable,
  TextEditorDecorationType,
  ExtensionContext,
  TextEditorSelectionChangeEvent,
  window,
  Uri,
  Range,
} from 'vscode';

export class EditorUtil implements Disposable {
  private eventDisposable?: Disposable;
  private decorationType?: TextEditorDecorationType;

  constructor(private context: ExtensionContext) {
    this.eventDisposable = window.onDidChangeTextEditorSelection(
      this.onChangeSelection.bind(this),
    );
  }

  private async onChangeSelection(e: TextEditorSelectionChangeEvent) {
    const hasSelection = !e.selections[0].isEmpty;
    // console.log(hasSelection, e.selections);
    this.decorationType?.dispose();
    this.decorationType = window.createTextEditorDecorationType({
      gutterIconPath: Uri.file(this.context.asAbsolutePath('static/icon.png')),
      gutterIconSize: 'contain',
      // after: {
      //   contentText: '🔧',
      //   margin: '0 0 0 5px',
      //   color: 'red', // You can specify a color for the icon or text here
      //   fontWeight: 'bold',
      // },
    });
    if (!hasSelection) {
      window.activeTextEditor?.setDecorations(this.decorationType, []);
      return;
    }
    const startPos = e.selections[0].start;
    const endPos = e.selections[0].start;

    const decorationRange = new Range(startPos, endPos);
    window.activeTextEditor?.setDecorations(this.decorationType, [
      {
        range: decorationRange,
      },
    ]);
  }

  public dispose() {
    this.decorationType?.dispose();
    this.eventDisposable?.dispose();
  }
}
