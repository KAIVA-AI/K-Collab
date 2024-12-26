import { Dictionary } from 'lodash';
import { RootStore } from '../stores';

export interface BaseComponentProps {
  rootStore?: RootStore;
}

export interface Tab {
  key: string;
  label: string;
  content: TableContent;
}

export interface TableContent {
  type: string;
  headers: string[];
  rows: Array<{
    type: string;
    data: Array<{
      type: string;
      command?: string;
      instruction?: string;
      value?: string;
    }>;
  }>;
}
