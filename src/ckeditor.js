/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

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
			// Don't define it in #props because it produces a warning.
			// https://vuejs.org/v2/guide/components-props.html#One-Way-Data-Flow
			instance: null
		};
	},

	mounted() {
		this.editor.create( this.$el, this.config )
			.then( editor => {
				// Save the reference to the instance for further use.
				this.instance = editor;

				// Set the initial data of the editor.
				editor.setData( this.value );

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
		if ( this.instance ) {
			this.instance.destroy();
			this.instance = null;
		}

		// Note: By the time the editor is destroyed (promise resolved, editor#destroy fired)
		// the Vue component will not be able to emit any longer. So emitting #destroy a bit earlier.
		this.$emit( 'destroy', this.instance );
	},

	watch: {
		// Synchronize changes of #value.
		value( val ) {
			// If the change is the result of typing, the #value is the same as instance.getData().
			// In that case, the change has been triggered by instance.model.document#change:data
			// so #value and instance.getData() are already in sync. Executing instance#setData()
			// would demolish the selection.
			if ( this.instance.getData() !== val ) {
				this.instance.setData( val );
			}
		},

		// Synchronize changes of #disabled.
		disabled( val ) {
			this.instance.isReadOnly = val;
		}
	},

	methods: {
		$_setUpEditorEvents() {
			const editor = this.instance;

			editor.model.document.on( 'change:data', evt => {
				const data = editor.getData();

				// The compatibility with the v-model and general Vue.js concept of input–like components.
				this.$emit( 'input', data, evt, editor );
			} );

			editor.editing.view.document.on( 'focus', evt => {
				this.$emit( 'focus', evt, editor );
			} );

			editor.editing.view.document.on( 'blur', evt => {
				this.$emit( 'blur', evt, editor );
			} );
		}
	}
};
