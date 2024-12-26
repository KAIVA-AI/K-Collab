import { Observer } from 'mobx-react';
import { IMessage } from '../../../models';
import { useRootStore } from '../../../stores';
import { useEffect, useRef, useState } from 'react';

export const ChatMessageItem = (props: { message: IMessage }) => {
  const { message } = props;
  const { chatViewModel } = useRootStore();
  const renderedMarkdownRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [codeTexts, setCodeTexts] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const codeBlockList =
      renderedMarkdownRef.current?.querySelectorAll('div.codehilite');
    if (codeBlockList) {
      const initialCodeTexts: { [key: number]: string } = {};

      codeBlockList.forEach((codehilite, index) => {
        const preCode = codehilite.querySelector('pre');
        if (!preCode) return;
        preCode.className = 'block-code';

        // Store the full HTML content for the icons
        const fullText = preCode.innerHTML; // Use innerHTML for full HTML content

        const codeAction = document.createElement('div');
        codeAction.className = 'message-code-action';

        const previewIcon = document.createElement('i');
        previewIcon.className =
          'c-pointer codicon codicon-git-pull-request-go-to-changes';
        previewIcon.title = 'Preview difference';
        previewIcon.onclick = () =>
          chatViewModel.clickPreviewChange(fullText || '');
        codeAction.appendChild(previewIcon);

        const insertIcon = document.createElement('i');
        insertIcon.className = 'c-pointer codicon codicon-insert';
        insertIcon.title = 'Add to current file';
        insertIcon.onclick = () =>
          chatViewModel.clickInsertMessage(fullText || '');
        codeAction.appendChild(insertIcon);

        const copyIcon = document.createElement('i');
        copyIcon.className = 'c-pointer codicon codicon-copy';
        copyIcon.title = 'Copy code';
        copyIcon.onclick = () => chatViewModel.clickCopyMessage(fullText || '');
        codeAction.appendChild(copyIcon);

        codehilite.prepend(codeAction);

        // Store the initial inner text for toggling
        const codeText = preCode.innerText;
        initialCodeTexts[index] = codeText; // Store the original full conten
        const isLong = codeText.length > 200; // Define length threshold for "Read more"
        if (isLong && !expanded[index]) {
          if (!codehilite.querySelector('.message_length_toggle')) {
            // setContent(codeText);
            preCode.innerText =
              initialCodeTexts[index].substring(0, 200) + '...'; // Show preview initially

            const toggleButton = document.createElement('button');
            toggleButton.className = 'message_length_toggle';
            toggleButton.innerText = 'Read more';
            // toggleButton.style.color = 'blue';
            // toggleButton.style.cursor = 'pointer';
            toggleButton.onclick = () => {
              setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
            };

            codehilite.appendChild(toggleButton);
          }
        }
      });
      // Set the full content for all code blocks
      setCodeTexts(initialCodeTexts);
    }
  }, [message]);

  useEffect(() => {
    const codeBlockList =
      renderedMarkdownRef.current?.querySelectorAll('div.codehilite');
    if (codeBlockList) {
      codeBlockList.forEach((codehilite, index) => {
        const preCode = codehilite.querySelector('pre');
        if (!preCode) return;

        const fullText = codeTexts[index]; // Full text to toggle
        if (!fullText) return;

        if (expanded[index]) {
          preCode.innerText = fullText; // Show full content
          const toggleButton = codehilite.querySelector(
            '.message_length_toggle',
          );
          if (toggleButton) toggleButton.innerHTML = 'Show less';
        } else {
          preCode.innerText = fullText.substring(0, 200) + '...'; // Show preview
          const toggleButton = codehilite.querySelector(
            '.message_length_toggle',
          );
          if (toggleButton) toggleButton.innerHTML = 'Read more';
        }
      });
    }
  }, [expanded, codeTexts]);

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
