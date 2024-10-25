import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { PreviewViewModel } from './preview.viewmodel';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

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
          <VSCodeButton onClick={() => this.vm.acceptChanges()}>
            Accept
          </VSCodeButton>
          <VSCodeButton
            appearance="secondary"
            onClick={() => this.vm.rejectChanges()}
          >
            Reject
          </VSCodeButton>
        </div>
        <ReactDiffViewer
          styles={{
            variables: {
              dark: {
                addedBackground: '#173d41',
                removedBackground: '#3e282a',
              },
            },
            gutter: {
              minWidth: 'unset',
            },
            diffContainer: {
              pre: {
                lineHeight: 'unset',
              },
            },
          }}
          oldValue={this.vm.oldContent}
          newValue={this.vm.newContent}
          splitView={true}
          useDarkTheme={this.rootStore.useDarkTheme}
          linesOffset={this.vm.startLine - 1}
          compareMethod={DiffMethod.WORDS}
        />
      </div>
    );
  }
}
export default PreviewPage;
