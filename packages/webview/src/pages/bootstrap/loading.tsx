import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import { Component } from 'react';

class LoadingPage extends Component {
  render() {
    return <VSCodeProgressRing />;
  }
}
export default LoadingPage;
