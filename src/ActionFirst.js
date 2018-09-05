// @flow
import Action from './Action';
let isEqual = require('lodash.isequal');

export default class ActionFirst<PayloadType, ResolveType> extends Action<
  PayloadType,
  ResolveType
> {
  executing: boolean;
  executingPayload: ?PayloadType;
  promise: Promise<ResolveType>;

  constructor(actionFunction: (payload: PayloadType) => Promise<ResolveType>) {
    super(actionFunction);
    this._reset.bind(this);
    this.execute.bind(this);

    this._reset();
  }
  _reset(): void {
    this.executing = false;
    this.executingPayload = null;
    delete this.promise;
  }
  execute(payload: PayloadType): Promise<ResolveType> {
    if (this.executing && isEqual(payload, this.executingPayload)) {
      return this.promise;
    }
    this.executing = true;
    this.promise = this._createRoutine(payload);
    this.executingPayload = payload;
    this.promise.then(this._reset.bind(this)).catch(this._reset.bind(this));
    return this.promise;
  }
}
