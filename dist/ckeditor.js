/*!
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CKEditor"] = factory();
	else
		root["CKEditor"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/plugin.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ckeditor.js":
/*!*************************!*\
  !*** ./src/ckeditor.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

/* harmony default export */ __webpack_exports__["default"] = ({
	name: 'ckeditor',

	render(createElement) {
		return createElement(this.tagName);
	},

	props: {
		editor: {
			type: Function,
			default: null
		},
		value: {
			type: String,
			default: ''
		},
		config: {
			type: Object,
			default: () => ({})
		},
		tagName: {
			type: String,
			default: 'div'
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},

	data() {
		return {
			// Don't define it in #props because it produces a warning.
			// https://vuejs.org/v2/guide/components-props.html#One-Way-Data-Flow
			instance: null
		};
	},

	mounted() {
		this.editor.create(this.$el, this.config).then(editor => {
			// Save the reference to the instance for further use.
			this.instance = editor;

			// Set the initial data of the editor.
			editor.setData(this.value);

			// Set initial disabled state.
			editor.isReadOnly = this.disabled;

			this.$_setUpEditorEvents();

			// Let the world know the editor is ready.
			this.$emit('ready', editor);
		}).catch(error => {
			console.error(error);
		});
	},

	beforeDestroy() {
		if (this.instance) {
			this.instance.destroy();
			this.instance = null;
		}

		// Note: By the time the editor is destroyed (promise resolved, editor#destroy fired)
		// the Vue component will not be able to emit any longer. So emitting #destroy a bit earlier.
		this.$emit('destroy', this.instance);
	},

	watch: {
		// Synchronize changes of #value.
		value(val) {
			// If the change is the result of typing, the #value is the same as instance.getData().
			// In that case, the change has been triggered by instance.model.document#change:data
			// so #value and instance.getData() are already in sync. Executing instance#setData()
			// would demolish the selection.
			if (this.instance.getData() !== val) {
				this.instance.setData(val);
			}
		},

		// Synchronize changes of #disabled.
		disabled(val) {
			this.instance.isReadOnly = val;
		}
	},

	methods: {
		$_setUpEditorEvents() {
			const editor = this.instance;

			editor.model.document.on('change:data', evt => {
				const data = editor.getData();

				// The compatibility with the v-model and general Vue.js concept of input–like components.
				this.$emit('input', data, evt, editor);
			});

			editor.editing.view.document.on('focus', evt => {
				this.$emit('focus', evt, editor);
			});

			editor.editing.view.document.on('blur', evt => {
				this.$emit('blur', evt, editor);
			});
		}
	}
});

/***/ }),

/***/ "./src/plugin.js":
/*!***********************!*\
  !*** ./src/plugin.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ckeditor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ckeditor.js */ "./src/ckeditor.js");
/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */



const CKEditor = {
	/**
  * Instals the plugin, registering the `<ckeditor>` component.
  *
  * @param {Vue} Vue The Vue object.
  * @param {Object} [config] Plugin configuration.
  * @param {Object.<String,Function>} [config.editors] The configuration of editor constructors and their names.
  */
	install(Vue, config) {
		// https://github.com/gotwarlost/istanbul/issues/665
		config = config || {};

		Vue.component('ckeditor', _ckeditor_js__WEBPACK_IMPORTED_MODULE_0__["default"]);

		Vue.prototype.$_ckeditor_types = config.editors;
	},
	component: _ckeditor_js__WEBPACK_IMPORTED_MODULE_0__["default"]
};

/* harmony default export */ __webpack_exports__["default"] = (CKEditor);

/***/ })

/******/ })["default"];
});
//# sourceMappingURL=ckeditor.js.map