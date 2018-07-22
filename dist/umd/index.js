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

  exports.Action = Action;
  exports.ActionFirst = ActionFirst;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
