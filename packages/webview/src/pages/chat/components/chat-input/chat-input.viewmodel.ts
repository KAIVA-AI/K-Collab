import { Constants } from '@v-collab/common';
import debounce from 'lodash/debounce';
import { action, computed, makeObservable, observable } from 'mobx';
import { ChangeEventHandler, createRef, KeyboardEvent } from 'react';

const slashCommands = [
  //
  'gen-code',
  'gen-test',
  'debug',
  'comment',
  'porting',
  'explain',
  'improve',
  'review',
];
const userMentions: string[] = [];
// TODO combine slash and users to single array

interface MentionItem {
  index: number;
  value: string;
  selected: boolean;
  className?: string;
}

export class ChatInputViewModel {
  @observable prompt = '';
  @observable sending = false;
  @observable sendingInputValue?: string = undefined;
  @observable filterMention?: string = undefined;
  @observable mentionIndex = 0;
  mentionListRef = createRef<any>();
  inputRef = createRef<HTMLTextAreaElement>();

  @action onChangePrompt: ChangeEventHandler<HTMLTextAreaElement> = event => {
    this.prompt = event.target.value;
  };

  private debounceDetectMention = debounce(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      this.detectMention(e);
    },
    200,
  );

  @computed get isShowMentionBox() {
    return this.filterMention !== undefined;
  }

  @computed get filteredSlashCommands(): MentionItem[] {
    return slashCommands
      .filter(command =>
        command
          .toLowerCase()
          .includes((this.filterMention || '').toLowerCase()),
      )
      .map((value, index) => {
        const classes: string[] = ['mention-item'];
        const selected = index === this.mentionIndex;
        if (selected) classes.push('selected');
        return {
          value,
          index,
          selected,
          className: classes.join(' '),
        };
      });
  }

  @computed get filteredUserMentions() {
    return userMentions.filter(mention =>
      mention.toLowerCase().includes((this.filterMention || '').toLowerCase()),
    );
  }

  @computed get hasSlashCommand() {
    return this.filteredSlashCommands.length > 0;
  }

  @computed get hasUserMention() {
    return this.filteredUserMentions.length > 0;
  }

  @computed get selectedMention() {
    return this.filteredSlashCommands[this.mentionIndex];
  }
  constructor() {
    makeObservable(this);
  }

  // TODO: refactor
  @action detectMention = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (typeof this.filterMention === 'string') {
      e.preventDefault();
      e.stopPropagation();
    }

    const target = e.target as HTMLTextAreaElement;
    const value = target.value || '';

    const containsMention = value.includes('@') || value.includes('/');
    if (!containsMention) {
      this.reset();
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
            !mentionText.startsWith('/') &&
            !mentionText.endsWith('**')
          ) {
            this.filterMention = mentionText;
            this.mentionIndex = 0;
            mentionFound = true;
            break;
          }
        }
      }
      if (!mentionFound) {
        this.reset();
      }
    }
  };

  @action handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e || !e.target) return;
    if (this.isShowMentionBox && e.key === 'Escape') {
      this.reset();
      return;
    }
    if (
      this.isShowMentionBox &&
      (e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'Enter' ||
        e.key === 'Tab')
    ) {
      e.preventDefault();
      if (['Enter', 'Tab'].includes(e.key)) {
        if (this.selectedMention) {
          const mentionText = this.filterMention || '';
          const selectedMention = this.selectedMention || '';
          this.reset();
          const temp = this.prompt;
          const target = e.target as HTMLInputElement;
          const _cursorPosition: number | null = target.selectionStart;

          if (!_cursorPosition) return;
          const first = temp
            ? temp.slice(0, _cursorPosition - mentionText.length)
            : '';
          const second = `${selectedMention} `; // TODO case user mention
          const third = temp ? temp.slice(_cursorPosition, temp.length) : '';

          this.prompt = `${first}${second}${third}`;
        }
        return;
      }
      this.onMentionNavigate(e);
      return;
    }
    this.debounceDetectMention(e);
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
        this.onSubmitInput();
      }
    }
  };

  private onMentionNavigate = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }
    if (e.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }
    if (e.key === 'Escape') {
      this.escapeHandler();
      return true;
    }
    return false;
  };

  private reset = () => {
    this.mentionListRef.current.scrollTo({
      top: 0,
      behavior: 'instant',
    });
    this.mentionIndex = 0;
    this.filterMention = undefined;
  };

  private upHandler = () => {
    const idx = this.filteredSlashCommands.length
      ? (this.mentionIndex + this.filteredSlashCommands.length - 1) %
        this.filteredSlashCommands.length
      : 0;

    this.mentionIndex = idx;
    this.scrollToItem(idx);
  };

  private downHandler = () => {
    const idx = this.filteredSlashCommands.length
      ? (this.mentionIndex + 1) % this.filteredSlashCommands.length
      : 0;

    this.mentionIndex = idx;
    this.scrollToItem(idx);
  };

  private escapeHandler = () => {
    this.mentionIndex = 0;
  };

  private scrollToItem = (index: number) => {
    const element = document.getElementById(`mention_item_${index}`);
    element && element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  @action onSubmitInput = async () => {
    const inputValue = `@**${Constants.BOT_CODING}** ${this.prompt}`;
    this.filterMention = undefined;
    this.prompt = '';
    this.sending = true;
    this.sendingInputValue = inputValue;
  };
}
