import { Observer } from 'mobx-react';
import { useRootStore } from '../../stores';

import './topic.scss';

export const TopicPage = () => {
  const { topicStore } = useRootStore();

  return (
    <Observer>
      {() => (
        <div className="topic-page">
          <span>Topics</span>
          <div className="topic-list">
            {topicStore.topics.map((topic, index) => (
              <div
                key={index}
                className="topic-item"
                onClick={() => {
                  topicStore.selectTopic(topic);
                }}
              >
                {topic.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </Observer>
  );
};
