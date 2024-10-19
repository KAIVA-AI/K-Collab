import { useState, ChangeEventHandler } from 'react';
import './chat.scss';

export function ChatPage() {
  const [prompt, setPrompt] = useState('');

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = event => {
    setPrompt(event.target.value);
  };

  return (
    <div className="chat-page">
      <div className="header-block"></div>
      <div className="main-block">
        <div>message 1</div>
        <div>message 2</div>
        <div>message 3</div>
      </div>
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
            onChange={handleChange}
            placeholder={`Talk about the...`}
            value={prompt}
          ></textarea>
        </div>
        <div className="action-block">
          <div className="action-left">
            <div className="action-icon">
              <i className="codicon codicon-mention" />
            </div>
          </div>
          <div className="action-right">
            <div className="action-icon">
              <i className="codicon codicon-send" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
