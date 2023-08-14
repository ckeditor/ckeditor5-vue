/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, console */

import { h, markRaw } from 'vue';
import { debounce } from 'lodash-es';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
const VUE_READ_ONLY_LOCK_ID = 'ckeditor-vue';

export default {
	name: 'ckeditor',
	created() {
		/**
		 * An instance of EditorWatchdog or an instance of EditorWatchdog-like adapter for ContextWatchdog.
		 *
		 * @type {module:watchdog/watchdog~Watchdog|EditorWatchdogAdapter}
		 */
		this.watchdog = null;

		this.lastEditorData = '';

		const { CKEDITOR_VERSION } = window;

		// Starting from v34.0.0, CKEditor 5 introduces a lock mechanism enabling/disabling the read-only mode.
		// As it is a breaking change between major releases of the integration, the component requires using
		// CKEditor 5 in version 34 or higher.
		if ( CKEDITOR_VERSION ) {
			const [ major ] = CKEDITOR_VERSION.split( '.' ).map( Number );

			if ( major < 34 ) {
				console.warn( 'The <CKEditor> component requires using CKEditor 5 in version 34 or higher.' );
			}
		} else {
			console.warn( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
		}
	},

	render() {
		return h( this.tagName );
	},

	model: {
		prop: 'modelValue',
		event: 'update:modelValue'
	},

	emits: [ 'update:modelValue',
		'input',
		'focus',
		'blur',
		'error',
		'ready',
		'destroy' ],

	props: {
		editor: {
			type: Function,
			default: null
		},
		modelValue: {
			type: String,
			default: ''
		},
		config: {
			type: Object,
			default: () => ( {} )
		},
		tagName: {
			type: String,
			default: 'div'
		},
		disabled: {
			type: Boolean,
			default: false
		},
		inputDebounce: {
			type: Number,
			default: 300
		},
		inputDebounceLeading: {
			type: Boolean,
			default: true
		}
	},

	mounted() {
		this._initializeEditor();
	},

	beforeUnmount() {
		const editor = this.getEditor();
		this._destroyEditor();

		// Note: By the time the editor is destroyed (promise resolved, editor#destroy fired)
		// the Vue component will not be able to emit any longer. So emitting #destroy a bit earlier.
		this.$emit( 'destroy', editor );
	},

	watch: {
		modelValue( value ) {
			// Synchronize changes of #modelValue. There are two sources of changes:
			//
			//                External modelValue change      ──────╮
			//                                                      ╰─────> ┏━━━━━━━━━━━┓
			//                                                              ┃ Component ┃
			//                                                      ╭─────> ┗━━━━━━━━━━━┛
			//                   Internal data change         ──────╯
			//             (typing, commands, collaboration)
			//
			// Case 1: If the change was external (via props), the editor data must be synced with
			// the component using instance#setData() and it is OK to destroy the selection.
			//
			// Case 2: If the change is the result of internal data change, the #modelValue is the
			// same as this.lastEditorData, which has been cached on #change:data. If we called
			// instance#setData() at this point, that would demolish the selection.
			//
			// To limit the number of instance#setData() which is time-consuming when there is a
			// lot of data we make sure:
			//    * the new modelValue is at least different than the old modelValue (Case 1.)
			//    * the new modelValue is different than the last internal instance state (Case 2.)
			//
			// See: https://github.com/ckeditor/ckeditor5-vue/issues/42.
			const editor = this.getEditor();
			if ( editor && value !== this.lastEditorData ) {
				editor.setData( value );
			}
		},

		// Synchronize changes of #disabled.
		disabled( readOnlyMode ) {
			const editor = this.getEditor();
			if ( !editor ) {
				return;
			}

			if ( readOnlyMode ) {
				editor.enableReadOnlyMode( VUE_READ_ONLY_LOCK_ID );
			} else {
				editor.disableReadOnlyMode( VUE_READ_ONLY_LOCK_ID );
			}
		}
	},

	methods: {
		setUpEditorEvents( editor ) {
			// Use the leading edge so the first event in the series is emitted immediately.
			// Failing to do so leads to race conditions, for instance, when the component modelValue
			// is set twice in a time span shorter than the debounce time.
			// See https://github.com/ckeditor/ckeditor5-vue/issues/149.
			const emitDebouncedInputEvent = debounce( evt => {
				// Cache the last editor data. This kind of data is a result of typing,
				// editor command execution, collaborative changes to the document, etc.
				// This data is compared when the component modelValue changes in a 2-way binding.
				const data = this.lastEditorData = editor.getData();

				// The compatibility with the v-model and general Vue.js concept of input–like components.
				this.$emit( 'update:modelValue', data, evt, editor );
				this.$emit( 'input', data, evt, editor );
			}, this.inputDebounce, { leading: this.inputDebounceLeading } );

			// Debounce emitting the #input event. When data is huge, instance#getData()
			// takes a lot of time to execute on every single key press and ruins the UX.
			//
			// See: https://github.com/ckeditor/ckeditor5-vu©e/issues/42
			editor.model.document.on( 'change:data', emitDebouncedInputEvent );

			editor.editing.view.document.on( 'focus', evt => {
				this.$emit( 'focus', evt, editor );
			} );

			editor.editing.view.document.on( 'blur', evt => {
				this.$emit( 'blur', evt, editor );
			} );
		},

		getWatchdog() {
			return EditorWatchdog;
		},

		getEditor() {
			return this.watchdog && this.watchdog.editor;
		},

		/**
		 * Initializes the editor by creating a proper watchdog and initializing it with the editor's configuration.
		 *
		 * @private
		 */
		_initializeEditor() {
			const Watchdog = this.getWatchdog();

			this.watchdog = markRaw( new Watchdog( this.editor ) );

			this.watchdog.setCreator( ( el, config ) => this._createEditor( el, config ) );

			this.watchdog.on( 'error', ( _, { error, causesRestart } ) => {
				console.error( 'watchdog', error );
				this.$emit( 'error', { phase: 'runtime', willEditorRestart: causesRestart, error } );
			} );

			this.watchdog.on( 'restart', () => {
				console.log( 'Editor was restarted.' );
			} );

			this.watchdog.on( 'stateChange', () => {
				if ( !this.watchdog ) {
					return;
				}

				const currentState = this.watchdog.state;

				console.log( 'watchdog', currentState );

				if ( currentState === 'crashedPermanently' && this.getEditor() ) {
					console.log( 'Editor has crashed permanently.' );
					this.getEditor().enableReadOnlyMode( 'crashed-editor' );
				}
			} );

			this.watchdog.create( this.$el, this._getConfig() )
				.catch( error => {
					console.error( error );
					this.$emit( 'error', { phase: 'initialization', willEditorRestart: false, error } );
				} );
		},

		/**
		 * Destroys the editor by destroying the watchdog.
		 *
		 * @private
		 */
		_destroyEditor() {
			// It may happen during the tests that the watchdog instance is not assigned before destroying itself. See: #197.
			/* istanbul ignore next */
			if ( !this.watchdog ) {
				return;
			}

			this.watchdog.destroy();
			this.watchdog = null;
		},
		_createEditor( element, config ) {
			return this.editor.create( element, config )
				.then( editor => {
					this.setUpEditorEvents( editor );

					// Synchronize the editor content. The #modelValue may change while the editor is being created, so the editor
					// content has to be synchronized with these potential changes as soon as it is ready.
					if ( this.modelValue !== config.initialData ) {
						editor.setData( this.modelValue );
					}

					// Set initial disabled state.
					if ( this.disabled ) {
						editor.enableReadOnlyMode( VUE_READ_ONLY_LOCK_ID );
					}

					// Let the world know the editor is ready.
					this.$emit( 'ready', editor );

					return editor;
				} );
		},

		/**
		 * Returns the editor configuration.
		 *
		 * @private
		 * @return {Object}
		 */
		_getConfig() {
			// Clone the config first so it never gets mutated (across multiple editor instances).
			// https://github.com/ckeditor/ckeditor5-vue/issues/101
			const editorConfig = Object.assign( {}, this.config );

			if ( this.modelValue ) {
				editorConfig.initialData = this.modelValue;
			}

			return editorConfig;
		}
	}
};
