import type ClassicEditor from '@ckeditor/ckeditor5-build-classic';

declare global {
	interface Window {
		editor: ClassicEditor;
	}
}
