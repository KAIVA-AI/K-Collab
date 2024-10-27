import { Observer } from 'mobx-react';
import { IMessage } from '../../../models';
import { useRootStore } from '../../../stores';
import { useEffect, useRef } from 'react';

export const ChatMessageItem = (props: { message: IMessage }) => {
  const { message } = props;
  const { chatViewModel } = useRootStore();
  const renderedMarkdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const codeBlockList =
      renderedMarkdownRef.current?.querySelectorAll('div.codehilite');
    if (codeBlockList) {
      codeBlockList.forEach(codehilite => {
        const preCode = codehilite.querySelector('pre');
        const codeAction = document.createElement('div');
        codeAction.className = 'message-code-action';

        const previewIcon = document.createElement('i');
        previewIcon.className =
          'c-pointer codicon codicon-git-pull-request-go-to-changes';
        previewIcon.onclick = () =>
          chatViewModel.clickPreviewChange(preCode?.innerHTML || '');
        codeAction.appendChild(previewIcon);

        const insertIcon = document.createElement('i');
        insertIcon.className = 'c-pointer codicon codicon-insert';
        insertIcon.onclick = () =>
          chatViewModel.clickInsertMessage(preCode?.innerHTML || '');
        codeAction.appendChild(insertIcon);

        const copyIcon = document.createElement('i');
        copyIcon.className = 'c-pointer codicon codicon-copy';
        copyIcon.onclick = () =>
          chatViewModel.clickCopyMessage(preCode?.innerHTML || '');
        codeAction.appendChild(copyIcon);

        codehilite.prepend(codeAction);
      });
    }
  }, [message]);

  return (
    <Observer>
      {() => (
        <div className="message-item">
          <div className="message-author">
            <img
              className="avatar"
              src="https://secure.gravatar.com/avatar/0a18525a190d4049400ec0d7fdfa0332?d=identicon&s=50"
              alt="avatar"
            />
            <div>{message.sender_full_name}</div>
          </div>
          <div className="message-content vc-border">
            <div
              ref={renderedMarkdownRef}
              dangerouslySetInnerHTML={{ __html: message.content }}
              className="rendered_markdown"
            ></div>
          </div>
        </div>
      )}
    </Observer>
  );
};
