/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

import { debounce } from 'lodash-es';

const INPUT_EVENT_DEBOUNCE_WAIT = 300;

// For better performance, we use a variable instead of a Vue reactive property.
// https://github.com/ckeditor/ckeditor5-vue/issues/153
let editorInstance;

export default {
	name: 'ckeditor',

	render( createElement ) {
		return createElement( this.tagName );
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
			default: () => ( {} )
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
			$_lastEditorData: {
				type: String,
				default: ''
			}
		};
	},

	mounted() {
		// Clone the config first so it never gets mutated (across multiple editor instances).
		// https://github.com/ckeditor/ckeditor5-vue/issues/101
		const editorConfig = Object.assign( {}, this.config );

		if ( this.value ) {
			editorConfig.initialData = this.value;
		}

		this.editor.create( this.$el, editorConfig )
			.then( editor => {
				// Save the reference to the instance for further use.
				editorInstance = editor;

				// Set initial disabled state.
				editor.isReadOnly = this.disabled;

				this.$_setUpEditorEvents();

				// Let the world know the editor is ready.
				this.$emit( 'ready', editor );
			} )
			.catch( error => {
				console.error( error );
			} );
	},

	beforeDestroy() {
		if ( editorInstance ) {
			editorInstance.destroy();
			editorInstance = null;
		}

		// Note: By the time the editor is destroyed (promise resolved, editor#destroy fired)
		// the Vue component will not be able to emit any longer. So emitting #destroy a bit earlier.
		this.$emit( 'destroy', editorInstance );
	},

	watch: {
		value( newValue, oldValue ) {
			// Synchronize changes of instance#value. There are two sources of changes:
			//
			//                     External value change      ------\
			//                                                       -----> +-----------+
			//                                                              | Component |
			//                                                       -----> +-----------+
			//                     Internal data change       ------/
			//              (typing, commands, collaboration)
			//
			// Case 1: If the change was external (via props), the editor data must be synced with
			// the component using instance#setData() and it is OK to destroy the selection.
			//
			// Case 2: If the change is the result of internal data change, the #value is the same as
			// instance#$_lastEditorData, which has been cached on instance#change:data. If we called
			// instance#setData() at this point, that would demolish the selection.
			//
			// To limit the number of instance#setData() which is time-consuming when there is a
			// lot of data we make sure:
			//    * the new value is at least different than the old value (Case 1.)
			//    * the new value is different than the last internal instance state (Case 2.)
			//
			// See: https://github.com/ckeditor/ckeditor5-vue/issues/42.
			if ( newValue !== oldValue && newValue !== this.$_lastEditorData ) {
				editorInstance.setData( newValue );
			}
		},

		// Synchronize changes of #disabled.
		disabled( val ) {
			editorInstance.isReadOnly = val;
		}
	},

	methods: {
		$_setUpEditorEvents() {
			const editor = editorInstance;
			// Use the leading edge so the first event in the series is emitted immediately.
			// Failing to do so leads to race conditions, for instance, when the component value
			// is set twice in a time span shorter than the debounce time.
			// See https://github.com/ckeditor/ckeditor5-vue/issues/149.
			const emitDebouncedInputEvent = debounce( evt => {
				// Cache the last editor data. This kind of data is a result of typing,
				// editor command execution, collaborative changes to the document, etc.
				// This data is compared when the component value changes in a 2-way binding.
				const data = this.$_lastEditorData = editor.getData();

				// The compatibility with the v-model and general Vue.js concept of input–like components.
				this.$emit( 'input', data, evt, editor );
			}, INPUT_EVENT_DEBOUNCE_WAIT, { leading: true } );

			// Debounce emitting the #input event. When data is huge, instance#getData()
			// takes a lot of time to execute on every single key press and ruins the UX.
			//
			// See: https://github.com/ckeditor/ckeditor5-vue/issues/42
			editor.model.document.on( 'change:data', emitDebouncedInputEvent );

			editor.editing.view.document.on( 'focus', evt => {
				this.$emit( 'focus', evt, editor );
			} );

			editor.editing.view.document.on( 'blur', evt => {
				this.$emit( 'blur', evt, editor );
			} );
		}
	}
};
