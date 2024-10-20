import { Observer } from 'mobx-react';
import { useRootStore } from '@src/stores';

export const ChatBottomComponent = () => {
  const { chatViewModel } = useRootStore();

  return (
    <Observer>
      {() => (
        <div className="bottom-block">
          <div className="context-block">
            <div className="add-context">
              <i className="codicon codicon-add" />
            </div>
            <div className="context-list">
              <div className="context-file">
                <span>index.ts</span>
                <i className="remove codicon codicon-close" />
              </div>
              <div className="context-file">
                <span>index.ts</span>
                <i className="remove codicon codicon-close" />
              </div>
              <div className="context-file">
                <span>index.ts</span>
                <i className="remove codicon codicon-close" />
              </div>
              <div className="context-file">
                <span>index.ts</span>
                <i className="remove codicon codicon-close" />
              </div>
              <div className="context-file">
                <span>index.ts</span>
                <i className="remove codicon codicon-close" />
              </div>
            </div>
          </div>
          <div className="input-block">
            <textarea
              onChange={chatViewModel.onChangePrompt}
              placeholder={`Talk about the...`}
              value={chatViewModel.prompt}
            />
          </div>
          <div className="action-block">
            <div className="action-left">
              <div className="action-icon">
                <i className="codicon codicon-mention" />
              </div>
            </div>
            <div className="action-right">
              <div className="action-icon" onClick={chatViewModel.sendMessage}>
                <i className="codicon codicon-send" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Observer>
  );
};
