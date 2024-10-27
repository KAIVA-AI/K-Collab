import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';

@inject('rootStore')
@observer
class WorkspacePage extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  get realmStore() {
    return this.rootStore.realmStore;
  }

  componentDidMount(): void {
    this.rootStore.setCurrentWebviewPageContext('workspace-page');
    this.realmStore.loadData();
  }

  render() {
    return (
      <div className="workspace-page us-none">
        <span>Workspace list:</span>
        <div className="workspace-list d-flex flex-col f-g-6px ma-3px">
          {this.realmStore.workspaces.map((workspace, index) => (
            <div
              key={index}
              className="workspace-item vc-border c-pointer vc-highlight-bg list-item"
              onClick={() => {
                this.realmStore.selectWorkspace(workspace);
              }}
            >
              {workspace.workspace_code}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
export default WorkspacePage;
