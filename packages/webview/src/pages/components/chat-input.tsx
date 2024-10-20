import { Observer } from 'mobx-react';
import { useRootStore } from '../../stores';
import { ChatInputMentionComponent } from './chat-input-mention';

export const ChatInputComponent = () => {
  const { chatViewModel } = useRootStore();

  return (
    <Observer>
      {() => (
        <>
          <ChatInputMentionComponent />
          <textarea
            id="chatbox__input"
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
      )}
    </Observer>
  );
};
