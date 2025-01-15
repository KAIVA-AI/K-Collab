import React, { useState } from 'react';
import '../../assets/scss/style.scss';

interface Tab {
  label: string;
  component: React.ReactNode;
}

interface Action {
  label: string;
  callback: () => void;
  disabled?: boolean; // Optional: disable the button
  variant?: 'primary' | 'secondary' | 'danger'; // Optional: style variants
}

interface TabbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[]; // Receive tabs from outside
  actions?: Action[]; // Footer actions
}

const TabbedModal: React.FC<TabbedModalProps> = ({
  isOpen,
  onClose,
  tabs,
  actions = [],
}) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={`modal-overlay ${isOpen ? 'visible' : 'hidden'}`}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header modal-tabs">
          {/* Tabs */}
          <div className="tab-switcher">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className={`tab ${index === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className="close-btn" onClick={onClose}>
            ×
          </div>
        </div>
        {/* Body */}
        <div className="modal-body">
          {/* Content */}
          <div className="modal-content">{tabs[activeTab].component}</div>

          {/* Footer */}
          {actions.length > 0 && (
            <div className="modal-footer">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={`action-btn ${action.variant || 'primary'}`}
                  onClick={action.callback}
                  disabled={action.disabled}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabbedModal;
