import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';

@inject('rootStore')
@observer
export class VersionPage extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  render() {
    return (
      <>
        <h2>Extension bạn cài đã cũ.</h2>
        <h2>Hãy download version mới nhất ở link sau:</h2>
        <h2>
          <a href={this.rootStore.linkToDownload}>Click</a>
        </h2>
      </>
    );
  }
}
