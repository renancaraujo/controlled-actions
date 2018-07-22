// @flow
import ActionFirst from './ActionFirst';

export default class ActionForceFirst<
  PayloadType,
  ResolveType
> extends ActionFirst<PayloadType, ResolveType> {
  execute(payload: PayloadType): Promise<ResolveType> {
    if (this.executing) {
      return this.promise;
    }
    this.executing = true;
    this.promise = this._createRoutine(payload);
    this.executingPayload = payload;
    this.promise.then(this._reset.bind(this)).catch(this._reset.bind(this));
    return this.promise;
  }
}
