import { createApp } from 'vue';
import CKEditorPlugin from '@ckeditor/ckeditor5-vue';
import App from './App.vue';

createApp( App )
	.use( CKEditorPlugin )
	.mount( '#app' );
