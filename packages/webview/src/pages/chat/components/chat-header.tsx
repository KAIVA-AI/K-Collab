import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';

@inject('rootStore')
@observer
export class ChatHeaderComponent extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  get topicStore() {
    return this.rootStore.topicStore;
  }

  render() {
    return (
      <div className="header-block">
        <div className="topic-name">
          Topic: {this.topicStore.currentTopic?.name}
        </div>
      </div>
    );
  }
}
