// @flow
export default class Action<PayloadType, ResolveType> {
  promise: Promise<ResolveType>;
  actionFunction: (payload: PayloadType) => Promise<ResolveType>;

  constructor(actionFunction: (payload: PayloadType) => Promise<ResolveType>) {
    this.actionFunction = actionFunction;
    this._createRoutine.bind(this);
    this.execute.bind(this);
  }
  _createRoutine(payload: PayloadType): Promise<ResolveType> {
    const returnedPromise = this.actionFunction(payload);
    return Promise.resolve(returnedPromise);
  }
  execute(payload: PayloadType): Promise<ResolveType> {
    return this._createRoutine(payload);
  }
}
