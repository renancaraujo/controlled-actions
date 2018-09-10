// @flow
import Action from './Action';
import isEqual from 'lodash/isEqual';

export default class ActionFirst<PayloadType, ResolveType> extends Action<
  PayloadType,
  ResolveType
> {
  executingPayload: ?PayloadType;
  promise: ?Promise<ResolveType>;

  constructor(actionFunction: (payload: PayloadType) => Promise<ResolveType>) {
    super(actionFunction);
    this._reset();
  }
  _reset: (?ResolveType) => void = () => {
    this.executingPayload = null;
    delete this.promise;
  };
  execute: PayloadType => Promise<ResolveType> = (payload: PayloadType) => {
    if (this.promise && isEqual(payload, this.executingPayload)) {
      return this.promise;
    }
    const promise = this._createRoutine(payload);
    this.promise = promise;
    this.executingPayload = payload;
    promise.finally(this._reset);
    return promise;
  };
}
