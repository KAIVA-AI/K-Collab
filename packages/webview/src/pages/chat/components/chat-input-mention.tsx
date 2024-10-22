import { Observer, observer } from 'mobx-react';
import clsx from 'clsx';
import { useRootStore } from '../../../stores';
import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';

interface IMentionBox {
  filter: string | undefined;
  setFilterMention: (mention: string | undefined) => void;
}

export const ChatInputMentionComponent = observer(
  forwardRef((props: IMentionBox, ref: any) => {
    const { filter, setFilterMention } = props;
    const { chatViewModel } = useRootStore();
    const parentRef = useRef<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<any>(0);
    const [list, setList] = useState<string[]>([]);
    const visible = typeof filter === 'string';

    useImperativeHandle(ref, () => ({
      onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        console.log('useImperativeHandle KEY DOWN ', e.key);
        if (e.key === 'ArrowUp') {
          upHandler();
          return true;
        }
        if (e.key === 'ArrowDown') {
          downHandler();
          return true;
        }
        if (e.key === 'Escape') {
          escapeHandler();
          return true;
        }
        // if (['Enter', 'Tab'].includes(e.key)) {
        //   chatViewModel.filteredSlashCommands[selectedIndex] || null;
        //   console.log('useImperativeHandle enter BINGO MENTION ');
        // }
        return false;
      },
      onSelectItem: () => {
        console.log(
          'useImperativeHandle SELECT ITEM ',
          selectedIndex,
          list[selectedIndex],
        );
        return list[selectedIndex] || null;
      },
      reset,
    }));

    // useEffect(() => {
    //   setList(chatViewModel.filteredSlashCommands);
    //   setFilterMention(
    //     chatViewModel.isShowMentionBox
    //       ? chatViewModel.filterMention
    //       : undefined,
    //   );
    //   console.log('MENTION BOX list ', list);
    //   console.log('MENTION BOX SELECTED INDEX ', selectedIndex);
    // }, [selectedIndex]);

    useEffect(() => {
      console.log(
        `FILTER VALUE CHANGE IN INPUT MENTION ${filter} : ${visible}`,
      );
      if (!filter) {
        setList(chatViewModel.filteredSlashCommands);
        console.log(
          'FILTER UNDEFINED ',
          filter,
          list,
          chatViewModel.filteredSlashCommands,
        );
      } else if (filter && visible) {
        const preferCommand = chatViewModel.filteredSlashCommands.filter(
          command => {
            console.log('filter value change ', filter);
            return command
              .toLowerCase()
              .includes(filter ? filter.toLowerCase() : '');
          },
        );
        setList(preferCommand);
        chatViewModel.filterMention = filter;
        console.log(
          'MENTION INPUT filter change the list',
          filter,
          filteredPreferCommand,
        );
        setSelectedIndex(0);
      }
    }, [filter]);

    const scrollToItem = (index: number) => {
      const element = document.getElementById(`mention_item_${index}`);
      element &&
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const upHandler = () => {
      const idx = list ? (selectedIndex + list.length - 1) % list.length : 0;

      setSelectedIndex(idx);
      scrollToItem(idx);
    };

    const downHandler = () => {
      const idx = list ? (selectedIndex + 1) % list.length : 0;

      setSelectedIndex(idx);
      scrollToItem(idx);
    };

    const escapeHandler = () => setSelectedIndex(0);

    const reset = () => {
      if (parentRef && parentRef.current) {
        parentRef.current.scrollTo({
          top: 0,
          behavior: 'instant',
        });
      }
      setSelectedIndex(0);
      setFilterMention(undefined);
    };

    // Function to filter topics by name
    const filteredPreferCommand = list.filter(mention => {
      console.log('log filter mention command', filter);
      return mention.toLowerCase().includes(filter ? filter.toLowerCase() : '');
    });

    return (
      <Observer>
        {() => (
          <div
            ref={parentRef}
            className={clsx('mention-list', !visible && 'hidden')}
          >
            <div className="mention-group">
              {list && list.length > 0 ? (
                list.map((command, index) => (
                  <div
                    key={index}
                    className={clsx(
                      'mention-item',
                      index === selectedIndex && 'selected',
                    )}
                    onClick={() => {
                      chatViewModel.handleSelectMention(command);
                    }}
                  >
                    /{command}
                  </div>
                ))
              ) : (
                <div className="mention-item">No available command</div>
              )}
            </div>
            <div className="mention-group">
              {chatViewModel.filteredUserMentions.map((command, index) => (
                <div
                  key={index}
                  className="mention-item"
                  onClick={() => {
                    chatViewModel.handleSelectMention(command);
                  }}
                >
                  /{command}
                </div>
              ))}
            </div>
          </div>
        )}
      </Observer>
    );
  }),
);
