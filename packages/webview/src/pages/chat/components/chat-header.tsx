import { Observer } from 'mobx-react';

export const ChatHeaderComponent = () => {
  return <Observer>{() => <div className="header-block"></div>}</Observer>;
};
