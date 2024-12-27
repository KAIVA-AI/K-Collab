import React from 'react';
import { TableContent } from '../../../../../models/base';

interface TableComponentProps {
  content: TableContent;
}

const TableComponent: React.FC<TableComponentProps> = ({ content }) => {
  // handler in the case of extends column each row by key of data
  const createGroupedRows = (columnsPerRow: number = 2) => {
    const flatData = content.rows[0]?.data || [];

    const groups: any[] = [];

    for (let i = 0; i < flatData.length; i += columnsPerRow) {
      for (let j = 0; j < columnsPerRow; j++) {
        const item = flatData[i + j];
        if (item) {
          groups.push(item);
        } else {
          /* empty */
        }
      }
    }
    return groups;
  };

  const renderCell = (item: any) => {
    const cells = [];
    // add more cells by listing of keys except 'type' to he
    const keys = Object.keys(item);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'type') {
        if (item.type === 'html') {
          cells.push(
            <td key={i} dangerouslySetInnerHTML={{ __html: item[keys[i]] }} />,
          );
        } else {
          cells.push(<td key={i}>{item[keys[i]]}</td>);
        }
      }
    }

    return <>{cells}</>;
  };

  return (
    <table className="table table-striped table-rounded table-bordered help-table">
      <thead>
        <tr>
          {content.headers.map((header: any, index: number) => (
            <th key={`header-${index}`}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {createGroupedRows(2).map((item, index) => (
          <tr key={`row-${index}`}>{renderCell(item)}</tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableComponent;
