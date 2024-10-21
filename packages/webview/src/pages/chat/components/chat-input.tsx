import { observer } from 'mobx-react';
import { useRootStore } from '../../../stores';
import { ChatInputMentionComponent } from './chat-input-mention';
import { useEffect, useRef } from 'react';

export const ChatInputComponent = observer(() => {
  const { chatViewModel } = useRootStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatViewModel.eventFocusInput) {
      inputRef.current?.focus();
      chatViewModel.eventFocusInput = false;
    }
  }, [chatViewModel.eventFocusInput]);

  return (
    <>
      <ChatInputMentionComponent />
      <textarea
        id="chatbox__input"
        ref={inputRef}
        value={chatViewModel.prompt}
        placeholder={`Talk about the...`}
        onChange={e => {
          chatViewModel.onChangePrompt(e);
          // handleTyping();
        }}
        onPaste={() => {
          // handlePasteFile
        }}
        onKeyDown={chatViewModel.handleKeyDown}
      />
    </>
  );
});
