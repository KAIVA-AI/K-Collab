import { inject, observer } from 'mobx-react';
import React from 'react';
import { RootStore } from 'src/stores';

@inject('rootStore')
@observer
export class CounterPage extends React.Component<{ rootStore?: RootStore }> {
  render() {
    const rootStore = this.props.rootStore!;
    return (
      <div>
        <h1>Counter</h1>
        <p>Count: {rootStore.count}</p>
        <button onClick={rootStore.increment}>Increment</button>
        <button onClick={rootStore.decrement}>Decrement</button>
      </div>
    );
  }
}
