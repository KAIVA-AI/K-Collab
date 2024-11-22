import { useRootStore } from '../../../stores';
import { observer } from 'mobx-react';
import { ChatMessageItem } from './chat-message-item';
import { useEffect, useRef } from 'react';
import { Constants } from '../../../../../common/src/constants/constants';
import TypingIndicator from './chat-input/typing-indicator';
export const ChatMainComponent = observer(() => {
  const { messageStore, realmStore } = useRootStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      const lastMessage = messagesEndRef.current.lastElementChild;
      lastMessage?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageStore.topicMessages]);

  useEffect(() => {
    const updateAnchorHref = () => {
      // Select the <a> tag inside the specified div class
      const anchorElement = document.querySelector(
        'div.message_inline_image a',
      );

      // Check if the <a> tag exists and update the href attribute
      if (anchorElement) {
        const currentHref = anchorElement.getAttribute('href');
        const image = anchorElement.querySelector('img');

        if (currentHref && image) {
          // Add prefix to the existing href
          const prefix = !realmStore.currentRealm?.realm_string
            ? ''
            : `${realmStore.currentRealm?.realm_string}.`;
          const newHref = `${Constants.ZULIP_PROTOCOL}${prefix}${Constants.ZULIP_SECONDARY_DOMAIN}/${currentHref}`;
          const imgSrc = `${Constants.ZULIP_PROTOCOL}${prefix}${Constants.ZULIP_SECONDARY_DOMAIN}/${image.getAttribute('src')}`;
          anchorElement.setAttribute('href', newHref);
          image.setAttribute('src', imgSrc);
        }
      }
    };
    // MutationObserver to watch for the element to be added to the DOM
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'childList' &&
          mutation.addedNodes.length > 0 &&
          document.querySelector('.message_inline_image a')
        ) {
          updateAnchorHref();
          observer.disconnect(); // Stop observing after modification
          break;
        }
      }
    });
    // Start observing the entire document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // // Call the function on component mount
    // updateAnchorHref();
    // Cleanup observer when component unmounts
    return () => observer.disconnect();
  }, []);

  return (
    <div className="main-block" ref={messagesEndRef}>
      {messageStore.topicMessages.map((message, index) => (
        <ChatMessageItem key={index} message={message} />
      ))}
      <TypingIndicator />
    </div>
  );
});
