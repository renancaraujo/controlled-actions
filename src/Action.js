// @flow
export default class Action<PayloadType, ResolveType> {
  promise: Promise<ResolveType>;
  actionFunction: (obj: {
    resolve: ResolveType => void,
    reject: any => any,
    payload: PayloadType,
  }) => any;

  constructor(
    actionFunction: (obj: {
      resolve: ResolveType => void,
      reject: any => any,
      payload: PayloadType,
    }) => any
  ) {
    this.actionFunction = actionFunction;
    this._createRoutine.bind(this);
    this.execute.bind(this);
  }
  _createRoutine(payload: PayloadType): Promise<ResolveType> {
    return new Promise((resolve, reject) => {
      try {
        this.actionFunction({
          resolve,
          reject,
          payload,
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  execute(payload: PayloadType): Promise<ResolveType> {
    return this._createRoutine(payload);
  }
}
