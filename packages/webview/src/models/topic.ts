import { TopicFileInput } from '@v-collab/common';

export interface ITopic {
  name: string;
  stream_id: string;
  file_inputs?: TopicFileInput[];
}
