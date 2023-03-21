import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig( {
	plugins: [ vue() ],
	optimizeDeps: {
		/**
		 * This is required only because we use "npm link" for
		 * testing purposes. See `dependencies` in `package.json`.
		 */
		include: [ '@ckeditor/ckeditor5-vue' ]
	}
} );
