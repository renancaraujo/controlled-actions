(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.moduleName = {})));
}(this, (function (exports) { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  //      
  var Action = function () {
    function Action(actionFunction) {
      classCallCheck(this, Action);

      this.actionFunction = actionFunction;
      this._createRoutine.bind(this);
      this.execute.bind(this);
    }

    createClass(Action, [{
      key: "_createRoutine",
      value: function _createRoutine(payload) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          try {
            _this.actionFunction({
              resolve: resolve,
              reject: reject,
              payload: payload
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    }, {
      key: "execute",
      value: function execute(payload) {
        return this._createRoutine(payload);
      }
    }]);
    return Action;
  }();

  //      
  var isEqual = require('lodash.isequal');

  var ActionFirst = function (_Action) {
    inherits(ActionFirst, _Action);

    function ActionFirst(actionFunction) {
      classCallCheck(this, ActionFirst);

      var _this = possibleConstructorReturn(this, (ActionFirst.__proto__ || Object.getPrototypeOf(ActionFirst)).call(this, actionFunction));

      _this._reset.bind(_this);
      _this.execute.bind(_this);

      _this._reset();
      return _this;
    }

    createClass(ActionFirst, [{
      key: '_reset',
      value: function _reset() {
        this.executing = false;
        this.executingPayload = null;
        delete this.promise;
      }
    }, {
      key: 'execute',
      value: function execute(payload) {
        if (this.executing && isEqual(payload, this.executingPayload)) {
          return this.promise;
        }
        this.executing = true;
        this.promise = this._createRoutine(payload);
        this.executingPayload = payload;
        this.promise.then(this._reset.bind(this)).catch(this._reset.bind(this));
        return this.promise;
      }
    }]);
    return ActionFirst;
  }(Action);

  //      

  var ActionForceFirst = function (_ActionFirst) {
    inherits(ActionForceFirst, _ActionFirst);

    function ActionForceFirst() {
      classCallCheck(this, ActionForceFirst);
      return possibleConstructorReturn(this, (ActionForceFirst.__proto__ || Object.getPrototypeOf(ActionForceFirst)).apply(this, arguments));
    }

    createClass(ActionForceFirst, [{
      key: 'execute',
      value: function execute(payload) {
        if (this.executing) {
          return this.promise;
        }
        this.executing = true;
        this.promise = this._createRoutine(payload);
        this.executingPayload = payload;
        this.promise.then(this._reset.bind(this)).catch(this._reset.bind(this));
        return this.promise;
      }
    }]);
    return ActionForceFirst;
  }(ActionFirst);

  //      

  var ActionLast = function (_Action) {
    inherits(ActionLast, _Action);

    function ActionLast(actionFunction) {
      classCallCheck(this, ActionLast);

      var _this = possibleConstructorReturn(this, (ActionLast.__proto__ || Object.getPrototypeOf(ActionLast)).call(this, actionFunction));

      _this.execute.bind(_this);
      _this._executeListeners.bind(_this);
      _this._executeRejectListeners.bind(_this);
      _this.resolveListeners = [];
      _this.rejectListeners = [];
      return _this;
    }

    createClass(ActionLast, [{
      key: '_executeListeners',
      value: function _executeListeners(result) {
        this.resolveListeners.map(function (resolveListener) {
          resolveListener(result);
        });

        this.resolveListeners = [];
        this.rejectListeners = [];
      }
    }, {
      key: '_executeRejectListeners',
      value: function _executeRejectListeners(error) {
        this.rejectListeners.map(function (rejectListener) {
          rejectListener(error);
        });

        this.resolveListeners = [];
        this.rejectListeners = [];
      }
    }, {
      key: 'execute',
      value: function execute(payload) {
        var _this2 = this;

        var newLastPromise = this._createRoutine(payload);
        this.lastPromise = newLastPromise;
        newLastPromise.then(function (result) {
          if (_this2.lastPromise === newLastPromise) {
            _this2._executeListeners(result);
          }
        }).catch(function (e) {
          if (_this2.lastPromise === newLastPromise) {
            _this2._executeRejectListeners(e);
          }
        }).finally(function () {
          if (_this2.lastPromise === newLastPromise) {
            _this2.resolveListeners = [];
            _this2.rejectListeners = [];
          }
        });

        return new Promise(function (resolve, reject) {
          try {
            var newResolveListener = function newResolveListener(a) {
              return resolve(a);
            };
            _this2.resolveListeners = [].concat(toConsumableArray(_this2.resolveListeners), [newResolveListener]);
            var newRejectListener = function newRejectListener(a) {
              return reject(a);
            };
            _this2.rejectListeners = [].concat(toConsumableArray(_this2.rejectListeners), [newRejectListener]);
          } catch (e) {
            reject(e);
          }
        });
      }
    }]);
    return ActionLast;
  }(Action);

  //

  exports.Action = Action;
  exports.ActionFirst = ActionFirst;
  exports.ActionForceFirst = ActionForceFirst;
  exports.ActionLast = ActionLast;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
