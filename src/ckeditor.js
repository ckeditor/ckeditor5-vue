/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export default {
	name: 'ckeditor',

	render: function( createElement ) {
		return createElement( this.tagName )
	},

	props: {
		editor: String,
		value: {
			type: String,
			default: ''
		},
		config: {
			type: Object,
			default: null
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

	data: function() {
		return {
			// Don't define it in #props because it produces a warning.
			// https://vuejs.org/v2/guide/components-props.html#One-Way-Data-Flow
			instance: null
		}
	},

	mounted() {
		this._editorTypes[ this.editor ]
			.create( this.$el, this.config )
			.then( editor => {
				// Save the reference to the instance for further use.
				this.instance = editor;
	
				// Set the initial data of the editor.
				editor.setData( this.value );

				// Set initial disabled state.
				editor.isReadOnly = this.disabled;
				
				// Let the world know the editor is ready.
				this.$emit( 'ready', editor );
	
				this.$_setUpEditorEvents();
			} )
			.catch( error => {
				console.error( error );
			} );
	},

	beforeDestroy() {
		if ( this.instance ) {
			this.instance.destroy()
			this.instance = null;
		}

		// Note: By the time the editor is destroyed (promise resolved, editor#destroy fired)
		// the Vue component will not be able to emit any longer. So emitting #destroy a bit earlier.
		this.$emit( 'destroy', this.instance );
	},

	watch: {
		// Synchronize changes of #value.
		value: function( val ) {
			this.instance.setData( val );
		},

		// Synchronize changes of #disabled.
		disabled: function( val ) {
			this.instance.isReadOnly = val;
		}
	},

	methods: {
		$_setUpEditorEvents() {
			const editor = this.instance;
	
			editor.model.document.on( 'change:data', ( evt ) => {
				const data = editor.getData();
	
				// The compatibility with the v-model and general Vue.js concept of input–like components.
				this.$emit( 'input', data, editor, data );
			} );
	
			editor.editing.view.document.on( 'focus', ( evt ) => {
				this.$emit( 'focus', evt, editor );
			} );
	
			editor.editing.view.document.on( 'blur', ( evt ) => {
				this.$emit( 'blur', evt, editor );
			} );
		}
	}
};