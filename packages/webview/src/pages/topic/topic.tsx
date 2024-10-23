import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from '../../models/base';

import './topic.scss';

@inject('rootStore')
@observer
class TopicPage extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  get topicStore() {
    return this.rootStore.topicStore;
  }

  render() {
    return (
      <div className="topic-page">
        <span>Topic list:</span>
        <div className="topic-list">
          {this.topicStore.topics.map((topic, index) => (
            <div
              key={index}
              className="topic-item"
              onClick={() => {
                this.topicStore.selectTopic(topic);
              }}
            >
              {topic.name}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default TopicPage;
