import { inject, observer } from 'mobx-react';
import { Component, createRef } from 'react';
import { BaseComponentProps } from '../../models/base';

import './topic.scss';

// Define the type for the component's state
interface TopicPageState {
  visibleCount: number;
}
@inject('rootStore')
@observer
class TopicPage extends Component<BaseComponentProps, TopicPageState> {
  state: TopicPageState = {
    visibleCount: 20, // Initial number of visible topics
  };

  listRef = createRef<HTMLDivElement>(); // Reference to the scrollable topic list

  get rootStore() {
    return this.props.rootStore!;
  }
  get topicStore() {
    return this.rootStore.topicStore;
  }

  componentDidMount(): void {
    this.rootStore.setCurrentWebviewPageContext('topic-page');
    this.topicStore.loadData();
    console.log('LOAD TOPICS DONE');

    // Add scroll event listener
    const listElement = this.listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', this.handleScroll);
    }
  }

  componentWillUnmount(): void {
    // Remove scroll event listener
    if (this.listRef.current) {
      this.listRef.current.removeEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll = () => {
    const listElement = this.listRef.current;
    if (!listElement) return;

    const { scrollTop, scrollHeight, clientHeight } = listElement;
    // Check if scrolled near the bottom
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.setState(prevState => ({
        visibleCount: Math.min(
          prevState.visibleCount + 20,
          this.topicStore.topics.length,
        ),
      }));
    }
  };

  render() {
    const { visibleCount } = this.state;
    const displayedTopics = this.topicStore.topics.slice(0, visibleCount);
    return (
      <div className="topic-page">
        <span>Topic list:</span>
        <div className="topic-list vc-scrollable" ref={this.listRef}>
          {displayedTopics.map((topic, index) => (
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
