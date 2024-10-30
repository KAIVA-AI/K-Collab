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

  componentDidMount(): void {
    this.rootStore.setCurrentWebviewPageContext('topic-page');
    this.topicStore.loadData();
  }

  render() {
    return (
      <div className="topic-page">
        <span>Topic list:</span>
        <div className="topic-list">
          {this.topicStore.topics.map((topic, index) => (
            <div
              key={index}
              className="topic-item vc-border"
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
