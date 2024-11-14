import { Constants } from '@v-collab/common';
import debounce from 'lodash/debounce';
import { action, computed, makeObservable, observable } from 'mobx';
import { ChangeEventHandler, createRef, KeyboardEvent } from 'react';
import { RootStore } from '../../../../stores/index';

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

  // @computed get filteredSlashCommands(): MentionItem[] {
  //   return slashCommands
  //     .filter(command =>
  //       command
  //         .toLowerCase()
  //         .includes((this.filterMention || '').toLowerCase()),
  //     )
  //     .map((value, index) => {
  //       const classes: string[] = ['mention-item'];
  //       const selected = index === this.mentionIndex;
  //       if (selected) classes.push('selected');
  //       return {
  //         value,
  //         index,
  //         selected,
  //         className: classes.join(' '),
  //       };
  //     });
  // }

  // @computed get filteredSlashAttribute(): MentionItem[] {
  //   if (!this.currentInput.includes('/attribute:')) {
  //     return [];
  //   }
  //   return slashAttribute
  //     .filter(command =>
  //       command
  //         .toLowerCase()
  //         .includes((this.filterMention || '').toLowerCase()),
  //     )
  //     .map((value, index) => {
  //       const classes: string[] = ['mention-item'];
  //       const selected = index === this.mentionIndex;
  //       if (selected) classes.push('selected');
  //       return {
  //         value,
  //         index,
  //         selected,
  //         className: classes.join(' '),
  //       };
  //     });
  // }

  // @computed get filteredContextImages(): MentionItem[] {
  //   // Filter file inputs if input starts with `/img:`
  //   if (this.currentInput.includes('/img:')) {
  //     const fileInputs =
  //       this.rootStore.topicStore.currentTopic?.file_inputs ?? [];
  //     return fileInputs.map((file, index) => ({
  //       value: file.name,
  //       index,
  //       selected: index === this.mentionIndex,
  //       className:
  //         index === this.mentionIndex
  //           ? 'mention-item selected'
  //           : 'mention-item',
  //     }));
  //   }
  //   return [];
  // }

  // @computed get filteredElements(): MentionItem[] {
  //   // Filter file inputs if input starts with `/img:`
  //   if (this.currentInput.includes('/element:')) {
  //     const fileInputs =
  //       this.rootStore.topicStore.currentTopic?.element_inputs ?? [];
  //     return fileInputs.map((file, index) => ({
  //       value: file.name,
  //       index,
  //       selected: index === this.mentionIndex,
  //       className:
  //         index === this.mentionIndex
  //           ? 'mention-item selected'
  //           : 'mention-item',
  //     }));
  //   }
  //   return [];
  // }

  @computed get filteredMentions(): MentionItem[] {
    // Dynamically determine which mention list to show based on the current input
    let mentionList: string[] = [];
    if (this.currentInput.includes('/img:')) {
      mentionList =
        this.rootStore.topicStore.currentTopic?.file_inputs?.map(
          file => file.name,
        ) || [];
    } else if (this.currentInput.includes('/element:')) {
      mentionList =
        this.rootStore.topicStore.currentTopic?.element_inputs?.map(
          file => file.name,
        ) || [];
    } else if (this.currentInput.includes('/attr:')) {
      mentionList = slashAttribute;
    } else {
      mentionList = slashCommands;
    }

    // Filter and map the list to MentionItem objects
    return mentionList
      .filter(mention =>
        mention
          .toLowerCase()
          .includes((this.filterMention || '').toLowerCase()),
      )
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

  // @computed get hasContextImage() {
  //   return this.filteredContextImages.length > 0;
  // }

  // @computed get hasSlashCommand() {
  //   return this.filteredSlashCommands.length > 0;
  // }

  @computed get selectedMention() {
    return this.filteredMentions[this.mentionIndex];
  }

  // @computed get selectedMentionElement() {
  //   return this.filteredElements[this.mentionIndex];
  // }

  // @computed get selectedMentionImages() {
  //   return this.filteredContextImages[this.mentionIndex];
  // }

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

    // const containsMention = value.includes('@') || value.includes('/');

    // Check for the mention types like /img:, /attr:, or /element:
    const imgMentionIndex = value.lastIndexOf('/img:', cursorPosition - 1);
    const attrMentionIndex = value.lastIndexOf('/attr:', cursorPosition - 1);
    const elementMentionIndex = value.lastIndexOf(
      '/element:',
      cursorPosition - 1,
    );
    const slashCommandIndex = value.lastIndexOf('/', cursorPosition - 1);

    // Define which mention prefix is active
    if (imgMentionIndex !== -1 && imgMentionIndex < cursorPosition) {
      this.filterMention = value.slice(imgMentionIndex + 5, cursorPosition); // Text after '/img:'
      // this.mentionType = 'img'; // New property to track type of mention
      this.mentionIndex = 0;
    } else if (attrMentionIndex !== -1 && attrMentionIndex < cursorPosition) {
      this.filterMention = value.slice(attrMentionIndex + 6, cursorPosition); // Text after '/attr:'
      // this.mentionType = 'attr';
      this.mentionIndex = 0;
    } else if (
      elementMentionIndex !== -1 &&
      elementMentionIndex < cursorPosition
    ) {
      this.filterMention = value.slice(elementMentionIndex + 9, cursorPosition); // Text after '/element:'
      // this.mentionType = 'element';
      this.mentionIndex = 0;
    } else if (slashCommandIndex !== -1 && slashCommandIndex < cursorPosition) {
      this.filterMention = value.slice(slashCommandIndex + 1, cursorPosition); // Text after '/'
      this.mentionIndex = 0;
    } else {
      this.reset();
    }
    console.log('FILTER AFTER DETECT ', this.filterMention);
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
    console.log(`SECLETLKJ ${select} | ${_filter}`);

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
    console.log(`first ${first} | `);
    this.prompt = `${first}${second}${third}`;
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
}
