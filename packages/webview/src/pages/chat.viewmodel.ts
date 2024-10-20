import { RootStore } from '../stores';
import { IZulipSendMessageParams } from '../models';
import { action, computed, makeObservable, observable } from 'mobx';
import { ChangeEventHandler, KeyboardEvent } from 'react';
import { debounce } from 'lodash';

const slashCommands = [
  //
  'explain',
  'improve',
  'enhance',
  'review',
];
const userMentions: string[] = [];

export class ChatViewModel {
  @observable prompt = '';
  @observable filterMention?: string = undefined;
  @observable sending = false;
  // TODO: refactor
  private debounceDetectMention = debounce(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      this.detectMention(e);
    },
    200,
  );

  @computed get isShowMentionBox() {
    return this.filterMention !== undefined;
  }

  @computed get filteredSlashCommands() {
    return slashCommands.filter(command =>
      command.includes(this.filterMention || ''),
    );
  }

  @computed get filteredUserMentions() {
    return userMentions.filter(mention =>
      mention.includes(this.filterMention || ''),
    );
  }

  @computed get hasSlashCommand() {
    return this.filteredSlashCommands.length > 0;
  }

  @computed get hasUserMention() {
    return this.filteredUserMentions.length > 0;
  }

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action onChangePrompt: ChangeEventHandler<HTMLTextAreaElement> = event => {
    this.prompt = event.target.value;
  };

  @action sendMessage = async () => {
    try {
      const inputValue = this.prompt;
      this.filterMention = undefined;
      this.prompt = '';

      this.sending = true;

      // extract values
      const _chatType: 'topic' | 'dm' = 'topic';
      const subject = 'same2';
      const targetId = 21;
      if (_chatType !== 'topic' && _chatType !== 'dm') {
        throw new Error('Invalid chat type');
      }
      let params: IZulipSendMessageParams | undefined = undefined;

      if (_chatType === 'topic') {
        params = {
          type: 'stream',
          to: targetId,
          topic: subject,
          content: inputValue,
        };
      } else if (_chatType === 'dm') {
        params = {
          type: 'direct',
          to: targetId,
          content: inputValue,
        };
      }

      return this.rootStore.zulipService.sendMessage(params!);
    } catch (error) {
      console.error('Error sending message', error);
    } finally {
      this.sending = false;
    }
  };

  @action detectMention = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (typeof this.filterMention === 'string') {
      e.preventDefault();
      e.stopPropagation();
    }

    const target = e.target as HTMLTextAreaElement;
    const value = target.value || '';

    const containsMention = value.includes('@') || value.includes('/');
    if (!containsMention) {
      this.filterMention = undefined;
      return;
    }

    const cursorPosition = target.selectionStart;
    if (cursorPosition === null) return;

    const atIndexes = Array.from(value).reduce<number[]>((acc, char, index) => {
      if (char === '@' || char === '/') acc.push(index);
      return acc;
    }, []);

    if (atIndexes.includes(cursorPosition - 1)) {
      this.filterMention = '';
      // mentionRef.current.onKeyDown(e);
    } else {
      let mentionFound = false;
      for (const atIndex of atIndexes) {
        if (atIndex < cursorPosition) {
          const mentionText =
            value
              .slice(atIndex + 1, cursorPosition)
              .match(/^[^\s\n\r]*$/)?.[0] || null;
          if (
            mentionText &&
            !mentionText.startsWith('**') &&
            !mentionText.endsWith('**')
          ) {
            this.filterMention = mentionText;
            // mentionRef.current.onKeyDown(e);
            mentionFound = true;
            break;
          }
        }
      }
      if (!mentionFound) {
        this.filterMention = undefined;
      }
    }
  };

  @action handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e || !e.target) return;
    if (this.isShowMentionBox && e.key === 'Escape') {
      this.filterMention = undefined;
      return;
    }
    this.debounceDetectMention(e);
    if (
      this.isShowMentionBox &&
      (e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'Enter')
    ) {
      e.preventDefault();
      // TODO not implemented select by keyboard
      // if (e.key === 'Enter') {
      //   // const mentionItem: IZulipUser | null =
      //   //   mentionRef.current.onSelectItem() || null;
      //   const mentionItem = {
      //     full_name: 'mentionItem',
      //   };
      //   if (mentionItem?.full_name) {
      //     const mentionText = this.filterMention || '';
      //     this.filterMention = undefined;
      //     const temp = this.prompt;
      //     const target = e.target as HTMLInputElement;
      //     const _cursorPosition: number | null = target.selectionStart;

      //     if (!_cursorPosition) return;
      //     const first = temp
      //       ? temp.slice(0, _cursorPosition - mentionText.length)
      //       : '';
      //     const second = `**${mentionItem?.full_name}** `;
      //     const third = temp ? temp.slice(_cursorPosition, temp.length) : '';

      //     this.prompt = `${first}${second}${third}`;
      //   }
      // }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        const value = (e.target as HTMLInputElement).value || '';
        const cursorPosition: number | null = (e.target as HTMLInputElement)
          .selectionStart;

        const first =
          value && cursorPosition ? value.slice(0, cursorPosition) : '';
        const second =
          value && cursorPosition
            ? value.slice(cursorPosition, value.length)
            : '';
        this.prompt = `${first}\n${second}`;
      } else {
        // if (isEditing) {
        //   handleEditMessage();
        // } else {
        //   sendMessage();
        // }
        this.sendMessage();
      }
    }
  };

  @action handleSelectMention = (select: string) => {
    // !todo: refactor function logic later
    const _item = select || '';
    const _filter = this.filterMention || '';

    const temp = this.prompt;
    const target = document.getElementById(
      'chatbox__input',
    ) as HTMLInputElement;
    this.filterMention = undefined;

    if (!target) return;
    const _cursorPosition: number | null = target.selectionStart;

    if (!_cursorPosition) return;

    const first = temp
      ? temp.slice(0, _cursorPosition - (_filter?.length || 0))
      : '';
    // const second = `**${_item}** `;
    const second = `${_item} `;
    const third = temp ? temp.slice(_cursorPosition, temp.length) : '';

    this.prompt = `${first}${second}${third}`;
    target && target.focus();
  };

  @action clickInsertMessage = (content: string) => {
    var tempElement = document.createElement('pre');
    tempElement.innerHTML = content;
    const text = tempElement.textContent || tempElement.innerText || '';
    this.rootStore.postMessageToVSCode({
      command: 'insertMessage',
      data: {
        content: text,
      },
    });
  };

  @action clickCopyMessage = (content: string) => {
    var tempElement = document.createElement('pre');
    tempElement.innerHTML = content;
    const text = tempElement.textContent || tempElement.innerText || '';
    this.rootStore.postMessageToVSCode({
      command: 'copyMessage',
      data: {
        content: text,
      },
    });
  };
}
