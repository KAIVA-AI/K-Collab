import React, { useEffect, useState, ChangeEvent } from 'react';
import './setting.scss';

const PersonalSetting: React.FC = () => {
  const [fontSize, setFontSize] = useState('16');

  const handleFontSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newFontSize = event.target.value;
    document.documentElement.style.setProperty(
      '--base-font-size',
      `${newFontSize}px`,
    );
    setFontSize(newFontSize);
  };

  useEffect(() => {
    const currentFontSize = getComputedStyle(document.documentElement)
      .getPropertyValue('--base-font-size')
      .trim()
      .replace('px', '');
    setFontSize(currentFontSize || '16');
  }, []);

  return (
    <div className="settings-container">
      {/* Sidebar Tabs */}
      <div className="sidebar">
        <ul className="tab-list">
          <li className="tab-item active">Preferences</li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="content">
        <h2>General</h2>
        <div className="setting-item">
          <label htmlFor="font-size">Message-area font size (px):</label>
          <select
            id="font-size"
            value={fontSize}
            onChange={handleFontSizeChange}
          >
            <option value="14">Small - 14px</option>
            <option value="16">Medium - 16px</option>
            <option value="18">Lagre - 18px</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PersonalSetting;
