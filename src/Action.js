// @flow
export default class Action<PayloadType, ResolveType> {
  actionFunction: (payload: PayloadType) => Promise<ResolveType>;

  constructor(actionFunction: (payload: PayloadType) => Promise<ResolveType>) {
    this.actionFunction = actionFunction;
  }
  _createRoutine: PayloadType => Promise<ResolveType> = (
    payload: PayloadType
  ) => {
    const returnedPromise = this.actionFunction(payload);
    return Promise.resolve(returnedPromise);
  };
  execute: PayloadType => Promise<ResolveType> = (payload: PayloadType) => {
    return this._createRoutine(payload);
  };
}
