// @flow
import ActionFirst from './ActionFirst';

export default class ActionForceFirst<
  PayloadType,
  ResolveType
> extends ActionFirst<PayloadType, ResolveType> {
  execute: PayloadType => Promise<ResolveType> = (payload: PayloadType) => {
    if (this.promise) {
      return this.promise;
    }
    const promise = this._createRoutine(payload);
    this.promise = promise;
    this.executingPayload = payload;
    promise.finally(this._reset);
    return promise;
  };
}
