(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.moduleName = {})));
}(this, (function (exports) { 'use strict';

  // @flow

  class Stuff {
      doStuff() {
          return 'haha hello';
      }
  }

  exports.Stuff = Stuff;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
