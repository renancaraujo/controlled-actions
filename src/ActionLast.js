import Action from './Action';

// @flow
export default class ActionLast<PayloadType, ResolveType> extends Action<
  PayloadType,
  ResolveType
> {
  resolveListeners: Array<(ResolveType) => void>;
  rejectListeners: Array<(void) => void>;
  lastPromise: Promise<ResolveType>;
  constructor(actionFunction: (payload: PayloadType) => Promise<ResolveType>) {
    super(actionFunction);
    this._executeListeners.bind(this);
    this._executeRejectListeners.bind(this);
    this.resolveListeners = [];
    this.rejectListeners = [];
  }
  _executeListeners(result: ResolveType): void {
    this.resolveListeners.map(resolveListener => {
      resolveListener(result);
    });

    this.resolveListeners = [];
    this.rejectListeners = [];
  }
  _executeRejectListeners(error: any): void {
    this.rejectListeners.map(rejectListener => {
      rejectListener(error);
    });

    this.resolveListeners = [];
    this.rejectListeners = [];
  }
  execute: PayloadType => Promise<ResolveType> = (payload: PayloadType) => {
    const newLastPromise = this._createRoutine(payload);
    this.lastPromise = newLastPromise;
    newLastPromise
      .then(result => {
        if (this.lastPromise === newLastPromise) {
          this._executeListeners(result);
        }
      })
      .catch(e => {
        if (this.lastPromise === newLastPromise) {
          this._executeRejectListeners(e);
        }
      })
      .finally(() => {
        if (this.lastPromise === newLastPromise) {
          this.resolveListeners = [];
          this.rejectListeners = [];
        }
      });

    return new Promise((resolve, reject) => {
      try {
        const newResolveListener: ResolveType => void = a => resolve(a);
        this.resolveListeners = [...this.resolveListeners, newResolveListener];
        const newRejectListener: void => void = a => reject(a);
        this.rejectListeners = [...this.rejectListeners, newRejectListener];
      } catch (e) {
        reject(e);
      }
    });
  };
}
