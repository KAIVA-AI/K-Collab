import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Tab } from '../../../../models/base';
import ModalBody from './modal-child-component/modal-body';
// interface Tab {
//   key: string;
//   label: string;
//   content: React.ReactNode;
// }
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
}

export interface ModalRef {
  open: () => void;
  close: () => void;
}

const Modal = forwardRef<ModalRef, ModalProps>(
  ({ isOpen, onClose, tabs }, ref) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.key);

    useImperativeHandle(ref, () => ({
      open: () => console.log('Modal opened'),
      close: () => console.log('Modal closed'),
    }));

    if (!isOpen) return null;

    const handleTabClick = (key: string) => {
      setActiveTab(key);
    };

    return (
      <div className={`modal-overlay ${isOpen ? 'visible' : 'hidden'}`}>
        <div className="modal-container">
          {/* Tab Headers */}
          <div className="modal-tabs">
            <div className="tab-switcher">
              {tabs.map(tab => (
                <div
                  key={tab.key}
                  className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab.key)}
                  role="button"
                  tabIndex={0}
                >
                  {tab.label}
                </div>
              ))}
            </div>
            <span className="close-btn" onClick={onClose}>
              ×
            </span>
          </div>

          {/* Tab Content */}
          <div className="modal-body">
            <ModalBody tabs={tabs} activeTab={activeTab} />
          </div>
        </div>
      </div>
    );
  },
);

export default Modal;
