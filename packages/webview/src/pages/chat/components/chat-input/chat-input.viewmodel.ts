import { Constants } from '@v-collab/common';
import debounce from 'lodash/debounce';
import { action, computed, makeObservable, observable } from 'mobx';
import { ChangeEventHandler, createRef, KeyboardEvent } from 'react';
import { RootStore } from '../../../../stores/index';
import { ITypingStatusParams } from '../../../../../../common/src/models';
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
  'fixbug',
  'html',
  'html_item',
];
// const userMentions: string[] = [];
// TODO combine slash and users to single array

const slashAttribute = [
  //
  'href',
  'src',
  'width',
  'height',
  'maxlength',
  'value',
  'name',
  'id',
];

interface MentionTrigger {
  trigger: string; // The trigger string (e.g., "/", "img:", "attr:")
  type: string; // The type of mention (e.g., "command", "file_input")
  prefix?: string; // Optional prefix to filter text after the trigger (e.g., "img:")
}

const mentionTriggers: MentionTrigger[] = [
  // { trigger: '@', type: 'mention' },
  { trigger: '/img:', type: 'image', prefix: 'img:' },
  { trigger: '/attr:', type: 'attribute', prefix: 'attr:' },
  { trigger: '/item:', type: 'item', prefix: 'item:' },
  { trigger: '/', type: 'command' },
];

interface MentionItem {
  index: number;
  value: string;
  selected: boolean;
  className?: string;
}

export class ChatInputViewModel {
  private rootStore: RootStore;
  @observable prompt = '';
  @observable sending = false;
  @observable sendingInputValue?: string = undefined;
  @observable filterMention?: string = undefined;
  @observable mentionType?: string = undefined;
  @observable mentionIndex = 0;

  @observable currentInput: string = '';

  @observable selectedCommandHistory: string | null = null;
  @observable currentHistoryIndex: number = -1;

  mentionListRef = createRef<any>();
  inputRef = createRef<HTMLTextAreaElement>();

  @action onChangePrompt: ChangeEventHandler<HTMLTextAreaElement> = event => {
    this.prompt = event.target.value;
    this.setCurrentInput(event.target.value);
  };

  private debounceDetectMention = debounce(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      this.detectMention(e);
    },
    200,
  );

  @action setSelectedCommandHistory(command: string) {
    this.selectedCommandHistory = command; // Update with the latest selected command
  }

  @action setCurrentInput(input: string) {
    this.currentInput = input;
  }

  @computed get isShowMentionBox() {
    return this.filterMention !== undefined;
  }

  @computed get filteredMentions(): MentionItem[] {
    if (this.mentionType === undefined) {
      return []; // No mention type detected, return an empty list
    }

    // Find the corresponding trigger configuration
    const currentTrigger = mentionTriggers.find(
      trigger => trigger.type === this.mentionType,
    );
    if (!currentTrigger) {
      return []; // No matching trigger, return an empty list
    }
    // Dynamically determine which mention list to show based on the current input
    let mentionList: string[] = [];

    switch (this.mentionType) {
      case 'image': // For /img: trigger
        mentionList =
          this.rootStore.topicStore.currentTopic?.file_inputs?.map(
            file => file.name,
          ) || [];
        break;

      case 'item': // For /item: trigger
        mentionList =
          this.rootStore.topicStore.currentTopic?.element_inputs?.map(
            file => file.name,
          ) || [];
        break;

      case 'attribute': // For /attr: trigger
        mentionList = slashAttribute;
        break;

      case 'command': // For / trigger (slash commands)
        mentionList = slashCommands;
        break;

      default:
        mentionList = []; // Empty list for unsupported types
        break;
    }

    // Filter and map the list to MentionItem objects
    return mentionList
      .filter(mention => {
        // Skip filtering if there's no current filter text
        if (!this.filterMention) return true;

        // Filter based on mention type and filterMention value
        return mention.toLowerCase().includes(this.filterMention.toLowerCase());
      })
      .map((value, index) => ({
        value,
        index,
        selected: index === this.mentionIndex,
        className:
          index === this.mentionIndex
            ? 'mention-item selected'
            : 'mention-item',
      }));
  }

  @computed get selectedMention() {
    return this.filteredMentions[this.mentionIndex];
  }

  constructor(rootStore: RootStore) {
    makeObservable(this);
    this.rootStore = rootStore;
  }

  // TODO: refactor
  @action detectMention = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (typeof this.filterMention === 'string') {
      e.preventDefault();
      e.stopPropagation();
    }

    const target = e.target as HTMLTextAreaElement;
    const value = target.value || '';
    const cursorPosition = target.selectionStart;
    if (cursorPosition === null) return;

    // Check for mentions only if any triggers exist
    const containsMention = mentionTriggers.some(({ trigger }) =>
      value.includes(trigger),
    );
    if (!containsMention) {
      this.reset();
      return;
    }

    let mentionFound = false;

    //Iterate through triggers to find the most relevant match
    for (const { trigger, type, prefix } of mentionTriggers) {
      const triggerIndex = value.lastIndexOf(trigger, cursorPosition - 1);
      if (triggerIndex >= 0 && triggerIndex < cursorPosition) {
        const mentionText = value
          .slice(triggerIndex + trigger.length, cursorPosition)
          .trim();

        // If a prefix is defined, remove it from the mention text
        if (prefix && mentionText.startsWith(prefix)) {
          this.filterMention = mentionText.slice(prefix.length);
        } else if (!prefix) {
          this.filterMention = mentionText;
        } else {
          this.filterMention = ''; // Reset if prefix mismatch
        }

        this.mentionType = type;
        this.mentionIndex = 0;
        mentionFound = true;
        break;
      }
    }
    if (!mentionFound) {
      this.reset();
    }
  };

  @action handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp' && this.selectedCommandHistory) {
      // On ArrowUp, set the input prompt to the last selected command
      this.prompt = this.selectedCommandHistory;
      e.preventDefault(); // Prevent default arrow-up behavior
    }

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
          const selectedMention = this.selectedMention?.value || '';
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
    const idx = this.filteredMentions.length
      ? (this.mentionIndex + this.filteredMentions.length - 1) %
        this.filteredMentions.length
      : 0;

    this.mentionIndex = idx;
    this.scrollToItem(idx);
  };

  private downHandler = () => {
    const idx = this.filteredMentions.length
      ? (this.mentionIndex + 1) % this.filteredMentions.length
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
    const second = `${_item} `;
    const third = temp ? temp.slice(_cursorPosition, temp.length) : '';
    this.prompt = `${first}${second}${third}`;

    for (const { trigger } of mentionTriggers) {
      const triggerIndex = temp.lastIndexOf(trigger, _cursorPosition - 1);

      if (triggerIndex !== -1) {
        const newValue =
          temp.slice(0, triggerIndex + trigger.length) +
          select +
          ' ' +
          temp.slice(_cursorPosition);

        target.value = newValue; // Update the text area
        this.filterMention = undefined; // Reset the filter
        return;
      }
    }

    target && target.focus();
  };

  @action onSubmitInput = async () => {
    if (this.prompt.startsWith('/')) {
      this.setSelectedCommandHistory(this.prompt); // Save the command as history
    }
    const inputValue = `@**${Constants.BOT_CODING}** ${this.prompt}`;
    this.filterMention = undefined;
    this.prompt = '';
    this.sending = true;
    this.sendingInputValue = inputValue;
  };
  get currentChatInfo() {
    const targetId = this.rootStore.channelStore.currentChannel?.stream_id;

    return {
      subject: this.rootStore.topicStore.currentTopic?.name || '',
      targetId: targetId || undefined,
    };
  }

  @action setTyping = (status: ITypingStatusParams['op']) => {
    const { targetId, subject } = this.currentChatInfo;

    const params: ITypingStatusParams | undefined = {
      type: 'stream',
      op: status,
      stream_id: targetId,
      topic: subject,
    };

    if (!params) return;
    return this.rootStore.zulipService.setTypingStatus(params);
  };
}
