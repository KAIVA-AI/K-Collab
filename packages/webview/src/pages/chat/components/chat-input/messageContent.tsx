import React, { FC, useState, useMemo } from 'react';

interface MessageContentProps {
  htmlContent: string;
}

const MessageContent: FC<MessageContentProps> = ({ htmlContent }) => {
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const processedContent = useMemo(() => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlContent;
    const codeBlocks = wrapper.querySelectorAll('code');
    const codeContent = Array.from(codeBlocks).map((codeBlock, index) => {
      const isLong = codeBlock.innerText.length > 200;
      return {
        content: codeBlock.innerText,
        isLong,
        previewText: isLong ? codeBlock.innerText.substring(0, 200) : '',
        index,
      };
    });
    return codeContent;
  }, [htmlContent]);

  const toggleReadMore = (index: number) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="message-content vc-border">
      {processedContent.map(({ content, isLong, previewText, index }) => (
        <pre key={index}>
          <code>
            {expanded[index] ? content : previewText}
            {isLong && (
              <button
                className="message_length_toggle"
                onClick={() => toggleReadMore(index)}
              >
                {expanded[index] ? 'Show less' : 'Read more'}
              </button>
            )}
          </code>
        </pre>
      ))}
    </div>
  );
};

export default MessageContent;
