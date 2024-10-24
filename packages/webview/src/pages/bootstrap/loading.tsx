import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import { Component } from 'react';

export class LoadingPage extends Component {
  render() {
    return <VSCodeProgressRing />;
  }
}
