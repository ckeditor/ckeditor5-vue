<template>
  <div class="rtc-editor">
    <div
      ref="presenceListRef"
      class="rtc-editor__presence"
    />

    <CkeditorMultiRoot
      v-if="isLayoutReady"
      v-model="editorData"
      v-model:roots-attributes="editorRootsAttributes"
      :editor="MultiRootEditor"
      :config="editorConfig"
      @ready="onReady"
      @error="onError"
    >
      <template #default="{ editor, roots, addRoot }">
        <div class="rtc-editor__toolbar">
          <CkeditorElement
            :editor="editor"
            element="menuBar"
          />
          <CkeditorElement :editor="editor" />
        </div>

        <div class="rtc-editor__roots">
          <div
            v-for="rootName in roots"
            :key="rootName"
            class="rtc-editor__root-block"
          >
            <div class="rtc-editor__root-header">
              <span class="rtc-editor__root-name">{{ rootName }}</span>
              <button
                class="rtc-btn rtc-btn--remove"
                type="button"
                @click="removeRoot( rootName )"
              >
                Remove
              </button>
            </div>

            <CkeditorMultiRootEditable
              :id="rootName"
              :root-name="rootName"
              :editor="editor"
            />
          </div>
        </div>

        <div class="rtc-editor__footer">
          <button
            class="rtc-btn rtc-btn--add"
            type="button"
            :disabled="!editor"
            @click="addRootFromState"
          >
            Add root
          </button>
          <button
            class="rtc-btn rtc-btn--add-inline"
            type="button"
            :disabled="!editor"
            @click="addInlineRoot( addRoot )"
          >
            Add inline root
          </button>
        </div>
      </template>
    </CkeditorMultiRoot>

    <div
      ref="sidebarRef"
      class="rtc-editor__sidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
	MultiRootEditor,
	Autoformat,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	BlockQuote,
	Essentials,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	Indent,
	IndentBlock,
	Link,
	List,
	ListProperties,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TableColumnResize,
	TextTransformation,
	CloudServices,
	type EditorConfig
} from 'ckeditor5';
import {
	RealTimeCollaborativeEditing,
	RealTimeCollaborativeComments,
	RealTimeCollaborativeTrackChanges,
	PresenceList,
	Comments,
	TrackChanges,
	TrackChangesData
} from 'ckeditor5-premium-features';

import type {
	AddRootOptions,
	MultiRootEditorData,
	MultiRootEditorErrorDescription,
	MultiRootEditorRootsAttributes
} from '../../src/plugin.js';

const INITIAL_DATA: MultiRootEditorData = {
	intro: '<h2>Introduction</h2><p>Start collaborating in real time.</p>',
	content: '<h3>Main content</h3><p>Add more roots with the button below.</p>'
};

const emit = defineEmits<{
	ready: [ editor: MultiRootEditor ];
}>();

const presenceListRef = ref<HTMLDivElement>();
const sidebarRef = ref<HTMLDivElement>();
const isLayoutReady = ref( false );
const editorData = ref<MultiRootEditorData>( { ...INITIAL_DATA } );
const editorRootsAttributes = ref<MultiRootEditorRootsAttributes>(
	Object.fromEntries( Object.keys( INITIAL_DATA ).map( name => [ name, {} ] ) )
);

const channelId = getCollaborationChannelId();
const credentials = getCollaborationCredentials();
const editorConfig = computed<EditorConfig>( () => ( {
	licenseKey: credentials.licenseKey,
	plugins: [
		Autoformat, BlockQuote, Bold, Essentials, Heading,
		Image, ImageCaption, ImageStyle, ImageToolbar,
		Indent, IndentBlock, Italic, Link, List, ListProperties,
		Paragraph, PasteFromOffice, Strikethrough,
		Table, TableColumnResize, TableToolbar,
		TextTransformation, Underline,

		Comments, PresenceList,
		RealTimeCollaborativeComments,
		RealTimeCollaborativeEditing,
		RealTimeCollaborativeTrackChanges,
		TrackChanges, TrackChangesData,
		CloudServices
	],
	toolbar: {
		items: [
			'undo', 'redo',
			'|', 'heading',
			'|', 'bold', 'italic', 'underline', 'strikethrough',
			'|', 'link', 'insertTable', 'blockQuote',
			'|', 'bulletedList', 'numberedList',
			'|', 'outdent', 'indent',
			'|', 'comment', 'trackChanges'
		],
		shouldNotGroupWhenFull: true
	},
	cloudServices: {
		tokenUrl: credentials.tokenUrl,
		uploadUrl: credentials.cloudServiceUploadUrl,
		webSocketUrl: credentials.websocketUrl
	},
	collaboration: { channelId },
	presenceList: { container: presenceListRef.value },
	sidebar: { container: sidebarRef.value },
	image: {
		toolbar: [
			'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
			'|', 'toggleImageCaption', 'imageTextAlternative'
		]
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableColumnResize' ]
	}
} ) );

onMounted( () => {
	isLayoutReady.value = true;
} );

function onReady( editor: MultiRootEditor ) {
	emit( 'ready', editor );
}

function onError( error: Error, description: MultiRootEditorErrorDescription<MultiRootEditor> ) {
	if ( 'causesRestart' in description && description.causesRestart ) {
		console.warn( '[RTCEditor] Crashed - watchdog will restart.', error );
	} else {
		console.error( '[RTCEditor] Fatal error.', error );
	}
}

function addRootFromState() {
	const name = `section-${ crypto.randomUUID() }`;

	editorData.value = {
		...editorData.value,
		[ name ]: '<h3>New section</h3><p>Start typing...</p>'
	};
	editorRootsAttributes.value = {
		...editorRootsAttributes.value,
		[ name ]: {}
	};
}

function addInlineRoot( addRoot: ( options: AddRootOptions ) => Promise<void> ) {
	void addRoot( {
		name: `inline-${ crypto.randomUUID() }`,
		data: 'Inline content.',
		attributes: {},
		editableOptions: {
			element: {
				name: 'span',
				styles: {
					display: 'inline-block',
					margin: '0',
					width: '100%'
				}
			},
			placeholder: 'Inline root...',
			label: 'Inline root'
		},
		modelElement: '$inlineRoot'
	} );
}

function removeRoot( rootName: string ) {
	const nextData = { ...editorData.value };
	const nextRootsAttributes = { ...editorRootsAttributes.value };

	delete nextData[ rootName ];
	delete nextRootsAttributes[ rootName ];

	editorData.value = nextData;
	editorRootsAttributes.value = nextRootsAttributes;
}

function getCollaborationChannelId(): string {
	const params = new URLSearchParams( window.location.search );
	const existing = params.get( 'channelId' );

	if ( existing ) {
		return existing;
	}

	const id = crypto.randomUUID();

	params.set( 'channelId', id );
	window.history.replaceState( null, '', `?${ params.toString() }` );

	return id;
}

function getCollaborationCredentials(): CollaborationCredentials {
	const env = import.meta.env as Record<string, string | undefined>;
	const licenseKey = env.CKEDITOR_LICENSE_KEY;
	const tokenUrl = env.CKEDITOR_TOKEN_URL;
	const websocketUrl = env.CKEDITOR_WEBSOCKET_URL;
	const cloudServiceUploadUrl = env.CKEDITOR_UPLOAD_URL;
	const missing = [
		[ 'CKEDITOR_LICENSE_KEY', licenseKey ],
		[ 'CKEDITOR_TOKEN_URL', tokenUrl ],
		[ 'CKEDITOR_WEBSOCKET_URL', websocketUrl ]
	].filter( ( [ , value ] ) => !value ).map( ( [ key ] ) => key );

	if ( missing.length ) {
		throw new Error(
			`[RTCEditor] Missing required env variables:\n  ${ missing.join( '\n  ' ) }\n` +
			'Copy .env.example to .env and fill in the values.'
		);
	}

	return {
		licenseKey,
		tokenUrl,
		websocketUrl,
		cloudServiceUploadUrl
	} as CollaborationCredentials;
}

type CollaborationCredentials = {
	licenseKey: string;
	tokenUrl: string;
	websocketUrl: string;
	cloudServiceUploadUrl?: string;
};
</script>
