import {
  CommentingRangeProvider,
  TextDocument,
  ProviderResult,
  Range,
  CommentController,
  comments,
  Disposable,
} from 'vscode';
import { RootStore } from '../stores';

const COMMENT_CONTROLLER_ID = 'k-collab.comment.ask';
const COMMENT_CONTROLLER_LABEL = 'Ask VietIS-Coding';

export class EditorCommentProvider implements CommentingRangeProvider {
  private controller: CommentController;

  constructor(private rootStore: RootStore) {
    this.controller = comments.createCommentController(
      COMMENT_CONTROLLER_ID,
      COMMENT_CONTROLLER_LABEL,
    );
    this.controller.commentingRangeProvider = this;
  }

  provideCommentingRanges = (
    document: TextDocument,
  ): ProviderResult<Range[]> => {
    // do not display when document is output channel
    if (document.uri.scheme === 'output') {
      return [];
    }
    const lineCount = document.lineCount;
    return [new Range(0, 0, lineCount - 1, 0)];
  };

  register = (): Disposable => {
    return this.controller;
  };
}
