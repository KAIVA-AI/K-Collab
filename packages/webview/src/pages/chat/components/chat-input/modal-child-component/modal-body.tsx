import TableComponent from './table-content';
import { Tab } from '../../../../../models/base';
import React from 'react';

interface ModalBodyProps {
  tabs: Tab[];
  activeTab: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ tabs, activeTab }) => {
  return (
    <>
      {tabs.map(tab => (
        <div
          key={tab.key}
          className={`tab-content ${activeTab === tab.key ? 'active' : 'd-none'}`}
        >
          {tab.content.type === 'table' ? (
            <TableComponent content={tab.content} />
          ) : null}
        </div>
      ))}
    </>
  );
};

export default ModalBody;
