import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { PreviewViewModel } from './preview.viewmodel';

@inject('rootStore')
@observer
class PreviewPage extends Component<BaseComponentProps> {
  private vm = new PreviewViewModel(this.rootStore);
  get rootStore() {
    return this.props.rootStore!;
  }

  render() {
    return (
      <div>
        <div className="d-flex f-g-6px mb-6px">
          <button onClick={() => this.vm.acceptChanges()}>Accept</button>
          <button onClick={() => this.vm.rejectChanges()}>Reject</button>
        </div>
      </div>
    );
  }
}
export default PreviewPage;
