import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { action } from 'mobx';

@inject('rootStore')
@observer
export class ChatHeaderComponent extends Component<BaseComponentProps> {
  state = {
    isEditing: false,
    topicName: this.topicStore.currentTopic?.name || '',
  };
  get rootStore() {
    return this.props.rootStore!;
  }
  get topicStore() {
    return this.rootStore.topicStore;
  }

  @action
  handleEditClick = () => {
    this.setState({ isEditing: true });
  };

  @action
  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ topicName: event.target.value });
  };

  @action
  handleSaveClick = () => {
    if (this.topicStore.currentTopic) {
      const oldestMessage = this.rootStore.messageStore.messages[0].id;
      this.topicStore.currentTopic.name = this.state.topicName;
      this.topicStore.EditTopic(this.topicStore.currentTopic, oldestMessage);
    } else {
      this.rootStore.postMessageToVSCode({
        command: 'raiseMessageToVscodeWindow',
        data: {
          message: "Couldn't save topic name because currentTopic is undefined",
        },
      });
    }
    this.setState({ isEditing: false });
  };

  @action
  handleCancelClick = () => {
    this.setState({
      isEditing: false,
      topicName: this.topicStore.currentTopic?.name || '',
    });
  };

  render() {
    const { isEditing, topicName } = this.state;

    return (
      <div className="header-block">
        <div className="current-workspace">
          Workspace: {this.rootStore.realmStore.currentRealm?.realm_string} /
          Topic:
          {isEditing ? (
            <div className="edit-topic">
              <input
                type="text"
                value={topicName}
                onChange={this.handleInputChange}
                autoFocus
              />
              <button onClick={this.handleSaveClick} className="save-btn">
                <i className="codicon codicon-check"></i>
              </button>
              <button onClick={this.handleCancelClick} className="cancel-btn">
                <i className="codicon codicon-close"></i>
              </button>
            </div>
          ) : (
            <div className="topic-name">
              <span>
                {this.topicStore.currentTopic?.name}
                <i
                  className="codicon codicon-edit edit-icon"
                  onClick={this.handleEditClick}
                />
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
