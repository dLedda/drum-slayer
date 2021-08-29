/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!./src/main.css":
/*!****************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!./src/main.css ***!
  \****************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ \"./node_modules/css-loader/dist/runtime/cssWithMappingToString.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \"body {\\n    color: red;\\n}\", \"\",{\"version\":3,\"sources\":[\"webpack://./src/main.css\"],\"names\":[],\"mappings\":\"AAAA;IACI,UAAU;AACd\",\"sourcesContent\":[\"body {\\n    color: red;\\n}\"],\"sourceRoot\":\"\"}]);\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);\n\n\n//# sourceURL=webpack://arne-drums/./src/main.css?./node_modules/css-loader/dist/cjs.js??ruleSet%5B1%5D.rules%5B1%5D.use%5B1%5D");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\n// css base code, injected by the css-loader\n// eslint-disable-next-line func-names\nmodule.exports = function (cssWithMappingToString) {\n  var list = []; // return the list of modules as css string\n\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = cssWithMappingToString(item);\n\n      if (item[2]) {\n        return \"@media \".concat(item[2], \" {\").concat(content, \"}\");\n      }\n\n      return content;\n    }).join(\"\");\n  }; // import a list of modules into the list\n  // eslint-disable-next-line func-names\n\n\n  list.i = function (modules, mediaQuery, dedupe) {\n    if (typeof modules === \"string\") {\n      // eslint-disable-next-line no-param-reassign\n      modules = [[null, modules, \"\"]];\n    }\n\n    var alreadyImportedModules = {};\n\n    if (dedupe) {\n      for (var i = 0; i < this.length; i++) {\n        // eslint-disable-next-line prefer-destructuring\n        var id = this[i][0];\n\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n\n    for (var _i = 0; _i < modules.length; _i++) {\n      var item = [].concat(modules[_i]);\n\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        // eslint-disable-next-line no-continue\n        continue;\n      }\n\n      if (mediaQuery) {\n        if (!item[2]) {\n          item[2] = mediaQuery;\n        } else {\n          item[2] = \"\".concat(mediaQuery, \" and \").concat(item[2]);\n        }\n      }\n\n      list.push(item);\n    }\n  };\n\n  return list;\n};\n\n//# sourceURL=webpack://arne-drums/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/cssWithMappingToString.js ***!
  \************************************************************************/
/***/ ((module) => {

eval("\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== \"undefined\" && arr[Symbol.iterator] || arr[\"@@iterator\"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nmodule.exports = function cssWithMappingToString(item) {\n  var _item = _slicedToArray(item, 4),\n      content = _item[1],\n      cssMapping = _item[3];\n\n  if (!cssMapping) {\n    return content;\n  }\n\n  if (typeof btoa === \"function\") {\n    // eslint-disable-next-line no-undef\n    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));\n    var data = \"sourceMappingURL=data:application/json;charset=utf-8;base64,\".concat(base64);\n    var sourceMapping = \"/*# \".concat(data, \" */\");\n    var sourceURLs = cssMapping.sources.map(function (source) {\n      return \"/*# sourceURL=\".concat(cssMapping.sourceRoot || \"\").concat(source, \" */\");\n    });\n    return [content].concat(sourceURLs).concat([sourceMapping]).join(\"\\n\");\n  }\n\n  return [content].join(\"\\n\");\n};\n\n//# sourceURL=webpack://arne-drums/./node_modules/css-loader/dist/runtime/cssWithMappingToString.js?");

/***/ }),

/***/ "./src/main.css":
/*!**********************!*\
  !*** ./src/main.css ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ \"./node_modules/style-loader/dist/runtime/styleDomAPI.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ \"./node_modules/style-loader/dist/runtime/insertBySelector.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ \"./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ \"./node_modules/style-loader/dist/runtime/insertStyleElement.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ \"./node_modules/style-loader/dist/runtime/styleTagTransform.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_main_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!./main.css */ \"./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].use[1]!./src/main.css\");\n\n      \n      \n      \n      \n      \n      \n      \n      \n      \n\nvar options = {};\n\noptions.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());\noptions.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());\n\n      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, \"head\");\n    \noptions.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());\noptions.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_main_css__WEBPACK_IMPORTED_MODULE_6__.default, options);\n\n\n\n\n       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_main_css__WEBPACK_IMPORTED_MODULE_6__.default && _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_main_css__WEBPACK_IMPORTED_MODULE_6__.default.locals ? _node_modules_css_loader_dist_cjs_js_ruleSet_1_rules_1_use_1_main_css__WEBPACK_IMPORTED_MODULE_6__.default.locals : undefined);\n\n\n//# sourceURL=webpack://arne-drums/./src/main.css?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

eval("\n\nvar stylesInDom = [];\n\nfunction getIndexByIdentifier(identifier) {\n  var result = -1;\n\n  for (var i = 0; i < stylesInDom.length; i++) {\n    if (stylesInDom[i].identifier === identifier) {\n      result = i;\n      break;\n    }\n  }\n\n  return result;\n}\n\nfunction modulesToDom(list, options) {\n  var idCountMap = {};\n  var identifiers = [];\n\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var count = idCountMap[id] || 0;\n    var identifier = \"\".concat(id, \" \").concat(count);\n    idCountMap[id] = count + 1;\n    var index = getIndexByIdentifier(identifier);\n    var obj = {\n      css: item[1],\n      media: item[2],\n      sourceMap: item[3]\n    };\n\n    if (index !== -1) {\n      stylesInDom[index].references++;\n      stylesInDom[index].updater(obj);\n    } else {\n      stylesInDom.push({\n        identifier: identifier,\n        updater: addStyle(obj, options),\n        references: 1\n      });\n    }\n\n    identifiers.push(identifier);\n  }\n\n  return identifiers;\n}\n\nfunction addStyle(obj, options) {\n  var api = options.domAPI(options);\n  api.update(obj);\n  return function updateStyle(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {\n        return;\n      }\n\n      api.update(obj = newObj);\n    } else {\n      api.remove();\n    }\n  };\n}\n\nmodule.exports = function (list, options) {\n  options = options || {};\n  list = list || [];\n  var lastIdentifiers = modulesToDom(list, options);\n  return function update(newList) {\n    newList = newList || [];\n\n    for (var i = 0; i < lastIdentifiers.length; i++) {\n      var identifier = lastIdentifiers[i];\n      var index = getIndexByIdentifier(identifier);\n      stylesInDom[index].references--;\n    }\n\n    var newLastIdentifiers = modulesToDom(newList, options);\n\n    for (var _i = 0; _i < lastIdentifiers.length; _i++) {\n      var _identifier = lastIdentifiers[_i];\n\n      var _index = getIndexByIdentifier(_identifier);\n\n      if (stylesInDom[_index].references === 0) {\n        stylesInDom[_index].updater();\n\n        stylesInDom.splice(_index, 1);\n      }\n    }\n\n    lastIdentifiers = newLastIdentifiers;\n  };\n};\n\n//# sourceURL=webpack://arne-drums/./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

eval("\n\nvar memo = {};\n/* istanbul ignore next  */\n\nfunction getTarget(target) {\n  if (typeof memo[target] === \"undefined\") {\n    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself\n\n    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n      try {\n        // This will throw an exception if access to iframe is blocked\n        // due to cross-origin restrictions\n        styleTarget = styleTarget.contentDocument.head;\n      } catch (e) {\n        // istanbul ignore next\n        styleTarget = null;\n      }\n    }\n\n    memo[target] = styleTarget;\n  }\n\n  return memo[target];\n}\n/* istanbul ignore next  */\n\n\nfunction insertBySelector(insert, style) {\n  var target = getTarget(insert);\n\n  if (!target) {\n    throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n  }\n\n  target.appendChild(style);\n}\n\nmodule.exports = insertBySelector;\n\n//# sourceURL=webpack://arne-drums/./node_modules/style-loader/dist/runtime/insertBySelector.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction insertStyleElement(options) {\n  var style = document.createElement(\"style\");\n  options.setAttributes(style, options.attributes);\n  options.insert(style);\n  return style;\n}\n\nmodule.exports = insertStyleElement;\n\n//# sourceURL=webpack://arne-drums/./node_modules/style-loader/dist/runtime/insertStyleElement.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\n/* istanbul ignore next  */\nfunction setAttributesWithoutAttributes(style) {\n  var nonce =  true ? __webpack_require__.nc : 0;\n\n  if (nonce) {\n    style.setAttribute(\"nonce\", nonce);\n  }\n}\n\nmodule.exports = setAttributesWithoutAttributes;\n\n//# sourceURL=webpack://arne-drums/./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction apply(style, options, obj) {\n  var css = obj.css;\n  var media = obj.media;\n  var sourceMap = obj.sourceMap;\n\n  if (media) {\n    style.setAttribute(\"media\", media);\n  } else {\n    style.removeAttribute(\"media\");\n  }\n\n  if (sourceMap && typeof btoa !== \"undefined\") {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  } // For old IE\n\n  /* istanbul ignore if  */\n\n\n  options.styleTagTransform(css, style);\n}\n\nfunction removeStyleElement(style) {\n  // istanbul ignore if\n  if (style.parentNode === null) {\n    return false;\n  }\n\n  style.parentNode.removeChild(style);\n}\n/* istanbul ignore next  */\n\n\nfunction domAPI(options) {\n  var style = options.insertStyleElement(options);\n  return {\n    update: function update(obj) {\n      apply(style, options, obj);\n    },\n    remove: function remove() {\n      removeStyleElement(style);\n    }\n  };\n}\n\nmodule.exports = domAPI;\n\n//# sourceURL=webpack://arne-drums/./node_modules/style-loader/dist/runtime/styleDomAPI.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction styleTagTransform(css, style) {\n  if (style.styleSheet) {\n    style.styleSheet.cssText = css;\n  } else {\n    while (style.firstChild) {\n      style.removeChild(style.firstChild);\n    }\n\n    style.appendChild(document.createTextNode(css));\n  }\n}\n\nmodule.exports = styleTagTransform;\n\n//# sourceURL=webpack://arne-drums/./node_modules/style-loader/dist/runtime/styleTagTransform.js?");

/***/ }),

/***/ "./src/Beat.ts":
/*!*********************!*\
  !*** ./src/Beat.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"BeatEvents\": () => (/* binding */ BeatEvents),\n/* harmony export */   \"default\": () => (/* binding */ Beat)\n/* harmony export */ });\n/* harmony import */ var _BeatUnit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BeatUnit */ \"./src/BeatUnit.ts\");\n/* harmony import */ var _Publisher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Publisher */ \"./src/Publisher.ts\");\n\n\nvar BeatEvents;\n(function (BeatEvents) {\n    BeatEvents[BeatEvents[\"NewTimeSig\"] = 0] = \"NewTimeSig\";\n    BeatEvents[BeatEvents[\"NewBarCount\"] = 1] = \"NewBarCount\";\n    BeatEvents[BeatEvents[\"NewName\"] = 2] = \"NewName\";\n    BeatEvents[BeatEvents[\"UnitChanged\"] = 3] = \"UnitChanged\";\n})(BeatEvents || (BeatEvents = {}));\nclass Beat {\n    static count = 0;\n    key;\n    name;\n    timeSigUp = 4;\n    timeSigDown = 4;\n    unitRecord = [];\n    barCount = 1;\n    publisher = new _Publisher__WEBPACK_IMPORTED_MODULE_1__.Publisher();\n    constructor(options) {\n        this.key = `Beat-${Beat.count}`;\n        this.name = options?.name ?? this.key;\n        this.setTimeSignature(options?.timeSig?.up ?? 4, options?.timeSig?.down ?? 4);\n        this.setBars(options?.bars ?? 48);\n        Beat.count++;\n    }\n    addSubscriber(subscriber, eventType) {\n        return this.publisher.addSubscriber(subscriber, eventType);\n    }\n    setTimeSignature(up, down) {\n        if (Beat.isValidTimeSigRange(up)) {\n            if (Beat.isValidTimeSigRange(down)) {\n                this.timeSigUp = up | 0;\n                this.timeSigDown = down | 0;\n                this.updateBeatUnitLength();\n                this.publisher.notifySubs(BeatEvents.NewTimeSig);\n            }\n        }\n    }\n    setBars(barCount) {\n        const isPosInt = (barCount > 0 && (barCount | 0) === barCount);\n        if (!isPosInt || barCount == this.barCount) {\n            return;\n        }\n        this.barCount = barCount;\n        this.updateBeatUnitLength();\n        this.publisher.notifySubs(BeatEvents.NewBarCount);\n    }\n    updateBeatUnitLength() {\n        const newBarCount = this.barCount * this.timeSigUp;\n        if (newBarCount < this.unitRecord.length) {\n            this.unitRecord.splice(this.barCount * this.timeSigUp, this.unitRecord.length - newBarCount);\n        }\n        else if (newBarCount > this.unitRecord.length) {\n            const barsToAdd = newBarCount - this.unitRecord.length;\n            for (let i = 0; i < barsToAdd; i++) {\n                this.unitRecord.push(new _BeatUnit__WEBPACK_IMPORTED_MODULE_0__.default());\n            }\n        }\n    }\n    getTimeSigUp() {\n        return this.timeSigUp;\n    }\n    getTimeSigDown() {\n        return this.timeSigDown;\n    }\n    turnUnitOn(index) {\n        if (Math.abs(index | 0) !== index) {\n            return;\n        }\n        const unit = this.getUnit(index);\n        if (unit) {\n            unit.setOn(true);\n            this.publisher.notifySubs(BeatEvents.UnitChanged);\n        }\n    }\n    turnUnitOff(index) {\n        if (Math.abs(index | 0) !== index) {\n            return;\n        }\n        const unit = this.getUnit(index);\n        if (unit) {\n            unit.setOn(false);\n            this.publisher.notifySubs(BeatEvents.UnitChanged);\n        }\n    }\n    toggleUnit(index) {\n        if (Math.abs(index | 0) !== index) {\n            return;\n        }\n        const unit = this.getUnit(index);\n        if (unit) {\n            unit.toggle();\n            this.publisher.notifySubs(BeatEvents.UnitChanged);\n        }\n    }\n    setUnitType(index, type) {\n        if (Math.abs(index | 0) !== index) {\n            return;\n        }\n        this.getUnit(index).setType(type);\n        this.publisher.notifySubs(BeatEvents.UnitChanged);\n    }\n    unitIsOn(index) {\n        return this.getUnit(index)?.isOn();\n    }\n    unitType(index) {\n        return this.getUnit(index)?.getType();\n    }\n    getUnit(index) {\n        if (!this.unitRecord[index]) {\n            throw new Error(`Invalid beat unit index! - ${index}`);\n        }\n        return this.unitRecord[index];\n    }\n    getBarCount() {\n        return this.barCount;\n    }\n    getKey() {\n        return this.key;\n    }\n    static isValidTimeSigRange(sig) {\n        return sig >= 2 && sig <= 64;\n    }\n    setName(newName) {\n        this.name = newName;\n        this.publisher.notifySubs(BeatEvents.NewName);\n    }\n    getName() {\n        return this.name;\n    }\n}\n\n\n//# sourceURL=webpack://arne-drums/./src/Beat.ts?");

/***/ }),

/***/ "./src/BeatGroup.ts":
/*!**************************!*\
  !*** ./src/BeatGroup.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ BeatGroup)\n/* harmony export */ });\n/* harmony import */ var _Beat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Beat */ \"./src/Beat.ts\");\n/* harmony import */ var _Publisher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Publisher */ \"./src/Publisher.ts\");\n\n\nclass BeatGroup {\n    beats = [];\n    beatKeyMap = {};\n    publisher = new _Publisher__WEBPACK_IMPORTED_MODULE_1__.Publisher();\n    constructor(options) {\n        if (options?.beats) {\n            for (const beatOptions of options.beats) {\n                const newBeat = new _Beat__WEBPACK_IMPORTED_MODULE_0__.default(beatOptions);\n                this.beats.push(newBeat);\n                this.beatKeyMap[newBeat.getKey()] = this.beats.length - 1;\n            }\n        }\n    }\n    addSubscriber(subscriber, eventType) {\n        return this.publisher.addSubscriber(subscriber, eventType);\n    }\n    getBeatByKey(beatKey) {\n        if (typeof this.beatKeyMap[beatKey] === \"undefined\") {\n            throw new Error(`Could not find the beat with key: ${beatKey}`);\n        }\n        return this.getBeatByIndex(this.beatKeyMap[beatKey]);\n    }\n    getBeatByIndex(beatIndex) {\n        if (!this.beats[beatIndex]) {\n            throw new Error(`Could not find the beat with index: ${beatIndex}`);\n        }\n        return this.beats[beatIndex];\n    }\n    getBeatCount() {\n        return this.beats.length;\n    }\n    getBeatKeys() {\n        return this.beats.map(beat => beat.getKey());\n    }\n    swapBeatsByIndices(beatIndex1, beatIndex2) {\n        const beat1 = this.getBeatByIndex(beatIndex1);\n        const beat2 = this.getBeatByIndex(beatIndex2);\n        this.beats[beatIndex1] = beat2;\n        this.beats[beatIndex2] = beat1;\n        this.beatKeyMap[beat1.getKey()] = beatIndex2;\n        this.beatKeyMap[beat2.getKey()] = beatIndex1;\n        this.publisher.notifySubs(0 /* BeatOrderChanged */);\n    }\n    swapBeatsByKeys(beatKey1, beatKey2) {\n        const index1 = this.beatKeyMap[this.getBeatByKey(beatKey1).getKey()];\n        const index2 = this.beatKeyMap[this.getBeatByKey(beatKey2).getKey()];\n        this.swapBeatsByIndices(index1, index2);\n    }\n    moveBeatBack(beatKey) {\n        const index = this.beatKeyMap[beatKey];\n        if (typeof index !== \"undefined\" && index > 0) {\n            this.swapBeatsByIndices(index, index - 1);\n        }\n        this.publisher.notifySubs(0 /* BeatOrderChanged */);\n    }\n    moveBeatForward(beatKey) {\n        const index = this.beatKeyMap[beatKey];\n        if (typeof index !== \"undefined\" && index < this.getBeatCount()) {\n            this.swapBeatsByIndices(index, index + 1);\n        }\n        this.publisher.notifySubs(0 /* BeatOrderChanged */);\n    }\n    canMoveBeatBack(beatKey) {\n        return this.beatKeyMap[beatKey] > 0;\n    }\n    canMoveBeatForward(beatKey) {\n        return this.beatKeyMap[beatKey] < this.beats.length - 1;\n    }\n    addBeat(options) {\n        const newBeat = new _Beat__WEBPACK_IMPORTED_MODULE_0__.default(options);\n        this.beats.push(newBeat);\n        this.beatKeyMap[newBeat.getKey()] = this.beats.length;\n        this.publisher.notifySubs(1 /* BeatListChanged */);\n        return newBeat;\n    }\n    removeBeat(beatKey) {\n        const beat = this.getBeatByKey(beatKey);\n        this.publisher.notifySubs(1 /* BeatListChanged */);\n        this.beats.splice(this.beats.indexOf(beat), 1);\n    }\n    setBeatName(beatKey, newName) {\n        this.getBeatByKey(beatKey).setName(newName);\n        this.publisher.notifySubs(0 /* BeatOrderChanged */);\n    }\n}\n\n\n//# sourceURL=webpack://arne-drums/./src/BeatGroup.ts?");

/***/ }),

/***/ "./src/BeatUnit.ts":
/*!*************************!*\
  !*** ./src/BeatUnit.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"BeatUnitType\": () => (/* binding */ BeatUnitType),\n/* harmony export */   \"default\": () => (/* binding */ BeatUnit)\n/* harmony export */ });\n/* harmony import */ var _Publisher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Publisher */ \"./src/Publisher.ts\");\n\nvar BeatUnitType;\n(function (BeatUnitType) {\n    BeatUnitType[BeatUnitType[\"Normal\"] = 0] = \"Normal\";\n    BeatUnitType[BeatUnitType[\"GhostNote\"] = 1] = \"GhostNote\";\n})(BeatUnitType || (BeatUnitType = {}));\nclass BeatUnit {\n    publisher = new _Publisher__WEBPACK_IMPORTED_MODULE_0__.Publisher();\n    on = false;\n    type = BeatUnitType.Normal;\n    constructor(on = false) {\n        this.on = on;\n    }\n    addSubscriber(subscriber, eventType) {\n        return this.publisher.addSubscriber(subscriber, eventType);\n    }\n    toggle() {\n        this.on = !this.on;\n        this.publisher.notifySubs(0 /* Toggle */);\n        if (this.on) {\n            this.publisher.notifySubs(1 /* On */);\n        }\n        else {\n            this.publisher.notifySubs(2 /* Off */);\n        }\n    }\n    setOn(on) {\n        this.on = on;\n        this.publisher.notifySubs(1 /* On */);\n    }\n    setType(type) {\n        this.type = type;\n        this.publisher.notifySubs(2 /* Off */);\n    }\n    getType() {\n        return this.type;\n    }\n    isOn() {\n        return this.on;\n    }\n}\n\n\n//# sourceURL=webpack://arne-drums/./src/BeatUnit.ts?");

/***/ }),

/***/ "./src/Publisher.ts":
/*!**************************!*\
  !*** ./src/Publisher.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Publisher\": () => (/* binding */ Publisher)\n/* harmony export */ });\nclass Publisher {\n    subscribers;\n    constructor() {\n        this.subscribers = new Map();\n        this.subscribers.set(\"all\", []);\n    }\n    addSubscriber(subscriber, eventType) {\n        let eventTypes = [];\n        if (!Array.isArray(eventType)) {\n            eventTypes.push(eventType);\n        }\n        else {\n            eventTypes = eventType;\n        }\n        for (const key of eventTypes) {\n            this.getSubscribers(key).push(subscriber);\n        }\n        return {\n            unbind: () => {\n                for (const key of eventTypes) {\n                    const subs = this.getSubscribers(key);\n                    subs.splice(subs.indexOf(subscriber), 1);\n                }\n            }\n        };\n    }\n    getSubscribers(key) {\n        const subscribersList = this.subscribers.get(key);\n        if (subscribersList === undefined) {\n            const newList = [];\n            this.subscribers.set(key, newList);\n            return newList;\n        }\n        else {\n            return subscribersList;\n        }\n    }\n    notifySubs(eventType) {\n        for (const sub of this.getSubscribers(eventType)) {\n            sub.notify(this, eventType);\n        }\n        for (const sub of this.getSubscribers(\"all\")) {\n            sub.notify(this, \"all\");\n        }\n    }\n}\n\n\n//# sourceURL=webpack://arne-drums/./src/Publisher.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _main_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.css */ \"./src/main.css\");\n/* harmony import */ var _BeatGroup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BeatGroup */ \"./src/BeatGroup.ts\");\n\n\nconst defaultSettings = {\n    bars: 10,\n    timeSig: {\n        down: 4,\n        up: 4,\n    },\n};\nconst mainBeatGroup = new _BeatGroup__WEBPACK_IMPORTED_MODULE_1__.default();\nmainBeatGroup.addBeat({\n    name: \"LF\"\n});\nmainBeatGroup.addBeat({\n    name: \"LH\"\n});\nmainBeatGroup.addBeat({\n    name: \"RH\"\n});\nmainBeatGroup.addBeat({\n    name: \"RF\"\n});\nfunction makeRoot() {\n    const rootNode = document.createElement(\"div\");\n    rootNode.innerText = \"Hello, world!\";\n    return rootNode;\n}\nconst appNode = document.querySelector(\"#app\");\nif (appNode) {\n    appNode.appendChild(makeRoot());\n    console.log(\"OK!\");\n}\nelse {\n    console.error(\"FUCK!\");\n}\n\n\n//# sourceURL=webpack://arne-drums/./src/main.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;