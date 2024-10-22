import { Observer } from 'mobx-react';
import { useRootStore } from '../../stores';
import { ChatInputMentionComponent } from './chat-input-mention';
import { useRef, useState, KeyboardEvent } from 'react';
import { debounce } from 'lodash';

export const ChatInputComponent = () => {
  const { chatViewModel } = useRootStore();
  const mentionRef = useRef<any>(null);

  const [filterMention, setFilterMention] = useState<string | undefined>(
    undefined,
  );
  console.log('INIT CHAT INPUT', filterMention);

  const detectMention = debounce((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (typeof filterMention === 'string') {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('detectMention EVENT ', e, 'ref ', mentionRef.current);

    const target = e.target as HTMLTextAreaElement;
    const value = target.value || '';

    const containsMention = value.includes('/');
    console.log('detectMention VALUE ', containsMention);
    if (!containsMention) {
      mentionRef.current.reset();
      return;
    }

    const cursorPosition = target.selectionStart;
    console.log('cursor position ', cursorPosition);

    if (cursorPosition === null) return;

    const atIndexes = Array.from(value).reduce<number[]>((acc, char, index) => {
      if (char === '/') acc.push(index);
      return acc;
    }, []);
    console.log('detectMention VALUE ATINDEXES ', atIndexes, cursorPosition);

    if (atIndexes.includes(cursorPosition - 1)) {
      setFilterMention('');
      console.log(
        'detectMention input filter ',
        typeof filterMention === 'string',
      );
      mentionRef.current.onKeyDown(e);
    } else {
      let mentionFound = false;
      for (const atIndex of atIndexes) {
        if (atIndex < cursorPosition) {
          const mentionText =
            value
              .slice(atIndex + 1, cursorPosition)
              .match(/^[^\s\n\r]*$/)?.[0] || null;
          console.log('mentionText chat input', mentionText);
          if (mentionText) {
            setFilterMention(mentionText);
            console.log('detectMention input filter 2', filterMention);

            mentionRef.current.onKeyDown(e);
            mentionFound = true;
            break;
          }
        }
      }
      if (!mentionFound) {
        mentionRef.current.reset();
      }
    }
    console.log('DONE DETECT');
  }, 200);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      mentionRef.current.reset();
      return;
    }
    detectMention(e);
    console.log('handleKeyDown chat input', e.key, 'filter ', filterMention);
    if (
      typeof filterMention === 'string' &&
      (e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'Enter' ||
        e.key === 'Tab')
    ) {
      console.log('AFTER DECTMENTION ', filterMention);
      e.preventDefault();
      console.log('e.key', e.key, ['Enter', 'Tab'].includes(e.key));
      if (['Enter', 'Tab'].includes(e.key)) {
        const mentionCommand = mentionRef.current.onSelectItem() || null;
        console.log('VALUE mentionCommand ', mentionCommand);
        if (mentionCommand) {
          mentionRef.current.reset();
          const temp = chatViewModel.prompt;
          const target = e.target as HTMLInputElement;
          const _cursorPosition: number | null = target.selectionStart;
          console.log(
            'after decat _cursorPosition',
            _cursorPosition,
            mentionCommand,
          );
          if (!_cursorPosition) return;
          const first = temp
            ? temp.slice(0, _cursorPosition - filterMention.length)
            : '';
          const second = `${mentionCommand}`;
          const third = temp ? temp.slice(_cursorPosition, temp.length) : '';
          console.log(
            `temp: ${temp} : target ${target} : cursor ${_cursorPosition}: first : ${first}: second: ${second}: third : ${third}`,
          );
          chatViewModel.prompt = `${first}${second}${third}`;
          console.log(
            'handleKeyDown RESULT ENTER INPUT ',
            chatViewModel.prompt,
          );
        }
      }
      return;
    }
    chatViewModel.handleKeyDown(e);
  };
  return (
    <Observer>
      {() => (
        <>
          <ChatInputMentionComponent
            filter={filterMention}
            setFilterMention={setFilterMention}
            ref={mentionRef}
          />
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
            onKeyDown={handleKeyDown}
          />
        </>
      )}
    </Observer>
  );
};
