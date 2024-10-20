import { action } from 'mobx';

export class ZulipStore {
  @action sendMessage = async (params: any) => {
    console.log(params);
    //
  };
}
