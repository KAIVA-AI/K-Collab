import { inject, observer } from 'mobx-react';
import { Component, ReactNode } from 'react';
import { BaseComponentProps } from 'src/models/base';
import './setting.scss';
import PersionalSetting from './persional-setting';
import TabbedModal from 'src/components/modal/modal';

interface SettingProps extends BaseComponentProps {
  children: ReactNode; // Các thành phần bên trong Setting
}

@inject('rootStore')
@observer
class Setting extends Component<SettingProps> {
  get rootStore() {
    return this.props.rootStore!;
  }

  get settingStore() {
    return this.rootStore.settingStore;
  }

  handleCloseModal = () => {
    this.settingStore.closeModal();
  };

  render() {
    const { children } = this.props;
    const { isModalSetting } = this.settingStore;
    console.log('gia tri modal setting', isModalSetting);
    const tabs = [{ label: 'Personal', component: <PersionalSetting /> }];

    return (
      <>
        {children}
        <TabbedModal
          isOpen={isModalSetting}
          onClose={this.handleCloseModal}
          tabs={tabs}
        />
      </>
    );
  }
}
export default Setting;
