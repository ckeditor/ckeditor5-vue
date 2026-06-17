<template>
  <h2 class="subtitle">
    Multi-root Editor Demo (rich integration)
  </h2>
  <p class="info">
    This sample demonstrates a more advanced integration of the multi-root editor in Vue.
  </p>
  <p class="info">
    Multiple extra features are implemented to illustrate how you can customize your application and use the provided API.<br>
    They are optional, and you do not need to include them in your application.<br>
    However, they can be a good starting point for your own custom features.
  </p>
  <p class="info">
    The &apos;Simulate an error&apos; button makes the editor throw an error to show you how it is restarted by
    the <code>Watchdog</code> mechanism.<br>
    Note, that <code>Watchdog</code> is enabled by default.<br>
    It can be disabled by passing the <code>disableWatchdog</code> flag to the <code>CkeditorMultiRoot</code> component.
  </p>
  <p class="info">
    Component&apos;s events are logged to the console.
  </p>
  <hr><br>

  <CkeditorMultiRoot
    v-model="editorData"
    v-model:roots-attributes="editorRootsAttributes"
    :editor="MultiRootEditor"
    @ready="onReady"
    @change="onChange"
    @blur="onBlur"
    @focus="onFocus"
  >
    <template #default="{ editor, addRoot, removeRoot }">
      <div class="buttons">
        <button
          :disabled="!editor || !Object.keys( editorData ).length"
          @click="toggleReadOnly"
        >
          Toggle read-only mode
        </button>

        <button
          :disabled="!editor"
          @click="simulateError"
        >
          Simulate an error
        </button>
      </div>

      <div class="buttons">
        <button
          :disabled="!selectedRoot"
          @click="onRemoveRoot( removeRoot, selectedRoot )"
        >
          Remove root
        </button>

        <select v-model="selectedRoot">
          <option
            hidden
            value=""
          >
            Select root to remove
          </option>

          <option
            v-for="rootName in Object.keys( editorData )"
            :key="rootName"
            :value="rootName"
          >
            {{ rootName }}
          </option>
        </select>
      </div>

      <div class="buttons">
        <button @click="onAddRoot( addRoot, { row: 'section-1' } )">
          Add row with roots
        </button>

        <input
          v-model.number="numberOfRoots"
          type="number"
          min="1"
          max="4"
          @change="normalizeNumberOfRoots"
        >

        <label>
          <input
            :checked="isInlineRoot"
            type="checkbox"
            @change="toggleInlineRoot"
          >
          Inline root (<code>$inlineRoot</code>)
        </label>
      </div>

      <br>

      <CkeditorMultiRootUI :editor="editor" />

      <div
        v-for="[ row, rootNames ] in groupedRootRows"
        :key="row"
        class="flex"
        :class="`wrapper-row-${ row }`"
      >
        <CkeditorMultiRootEditable
          v-for="rootName in rootNames"
          :id="rootName"
          :key="rootName"
          :root-name="rootName"
          :editor="editor"
          :editable-options="editableOptions[ rootName ]"
        />
      </div>
    </template>
  </CkeditorMultiRoot>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import type {
	EventInfo,
	MultiRootEditor as MultiRootEditorType
} from 'ckeditor5';

import type {
	AddRootOptions,
	MultiRootEditorData,
	MultiRootEditorRootAttributes,
	MultiRootEditorRootsAttributes,
	RootEditableOptionsAttribute
} from '../../src/plugin.js';

import MultiRootEditor from './MultiRootEditor.js';

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

const props = defineProps<{
	data: MultiRootEditorData;
	rootsAttributes: MultiRootEditorRootsAttributes;
}>();

const editorInstance = shallowRef<MultiRootEditorType | null>( null );
const editorData = ref<MultiRootEditorData>( { ...props.data } );
const editorRootsAttributes = ref<MultiRootEditorRootsAttributes>( cloneRootsAttributes( props.rootsAttributes ) );
const selectedRoot = ref( '' );
const numberOfRoots = ref( 1 );
const isInlineRoot = ref( false );
const disabledRoots = ref<Set<string>>( new Set() );
const editableOptions = ref<Record<string, RootEditableOptionsAttribute>>( {} );

const groupedRootRows = computed( () => groupRootRows( Object.keys( editorData.value ), editorRootsAttributes.value ) );

function toggleReadOnly() {
	const editor = editorInstance.value;
	const root = editor?.model.document.selection.getFirstRange()?.root;
	const rootName = root?.rootName;

	if ( !editor || !rootName ) {
		return;
	}

	const nextDisabledRoots = new Set( disabledRoots.value );

	if ( nextDisabledRoots.has( rootName ) ) {
		nextDisabledRoots.delete( rootName );
		editor.enableRoot( rootName, SAMPLE_READ_ONLY_LOCK_ID );
	} else {
		nextDisabledRoots.add( rootName );
		editor.disableRoot( rootName, SAMPLE_READ_ONLY_LOCK_ID );
	}

	disabledRoots.value = nextDisabledRoots;
}

function simulateError() {
	const editor = editorInstance.value;

	if ( !editor ) {
		return;
	}

	setTimeout( () => {
		const err = new Error( 'foo' ) as Error & {
			context: MultiRootEditorType;
			is: () => boolean;
		};

		err.context = editor;
		err.is = () => true;

		throw err;
	} );
}

async function onAddRoot(
	addRoot: ( options: AddRootOptions ) => Promise<void>,
	newRootAttributes: MultiRootEditorRootAttributes,
	rootId?: string | number
) {
	const id = String( rootId ?? Date.now() );

	for ( let i = 1; i <= numberOfRoots.value; i++ ) {
		const rootName = `root-${ i }-${ id }`;
		const rootEditableOptions = getEditableOptionsForNewRoot();

		editableOptions.value = {
			...editableOptions.value,
			[ rootName ]: rootEditableOptions
		};

		await addRoot( {
			name: rootName,
			attributes: {
				...newRootAttributes,
				order: i * 10,
				row: id
			},
			editableOptions: rootEditableOptions,
			...isInlineRoot.value && {
				modelElement: '$inlineRoot'
			}
		} );
	}

	numberOfRoots.value = 1;
}

async function onRemoveRoot(
	removeRoot: ( rootName: string ) => Promise<void>,
	rootName: string
) {
	if ( !rootName ) {
		return;
	}

	await removeRoot( rootName );

	const nextEditableOptions = {
		...editableOptions.value
	};

	delete nextEditableOptions[ rootName ];
	editableOptions.value = nextEditableOptions;
	selectedRoot.value = '';
}

function getEditableOptionsForNewRoot(): RootEditableOptionsAttribute {
	return {
		element: isInlineRoot.value ? {
			name: 'span',
			styles: {
				display: 'inline-block',
				margin: '0',
				width: '100%',
				paddingTop: 'var(--ck-spacing-large)',
				paddingBottom: 'var(--ck-spacing-large)'
			}
		} : 'div',
		placeholder: 'Test placeholder',
		label: 'Test label'
	};
}

function toggleInlineRoot( event: Event ) {
	isInlineRoot.value = ( event.target as HTMLInputElement ).checked;
}

function normalizeNumberOfRoots() {
	const value = Number( numberOfRoots.value );

	numberOfRoots.value = Math.min( 4, Math.max( 1, Number.isFinite( value ) ? Math.trunc( value ) : 1 ) );
}

function groupRootRows(
	rootNames: Array<string>,
	rootsAttributes: MultiRootEditorRootsAttributes
): Array<[ string, Array<string> ]> {
	const groupedRoots = [ ...rootNames ]
		.sort( ( a, b ) => getRootOrder( rootsAttributes, a ) - getRootOrder( rootsAttributes, b ) )
		.reduce<Record<string, Array<string>>>( ( result, rootName ) => {
			const row = getRootRow( rootsAttributes, rootName );

			result[ row ] = result[ row ] || [];
			result[ row ].push( rootName );

			return result;
		}, {} );

	return Object.entries( groupedRoots );
}

function getRootOrder( rootsAttributes: MultiRootEditorRootsAttributes, rootName: string ): number {
	const order = rootsAttributes[ rootName ]?.order;

	return typeof order === 'number' ? order : 0;
}

function getRootRow( rootsAttributes: MultiRootEditorRootsAttributes, rootName: string ): string {
	const row = rootsAttributes[ rootName ]?.row;

	return row === undefined ? rootName : String( row );
}

function cloneRootsAttributes( rootsAttributes: MultiRootEditorRootsAttributes ): MultiRootEditorRootsAttributes {
	return Object.keys( rootsAttributes ).reduce<MultiRootEditorRootsAttributes>( ( result, rootName ) => {
		result[ rootName ] = {
			...rootsAttributes[ rootName ]
		};

		return result;
	}, {} );
}

function onReady( editor: MultiRootEditorType ) {
	( window as Window & { editor?: MultiRootEditorType } ).editor = editor;
	editorInstance.value = editor;

	console.log( 'event: onReady', { editor } );
}

function onChange( event: unknown, editor: MultiRootEditorType ) {
	console.log( 'event: onChange', { event, editor } );
}

function onBlur( event: EventInfo, editor: MultiRootEditorType ) {
	console.log( 'event: onBlur', { event, editor } );
}

function onFocus( event: EventInfo, editor: MultiRootEditorType ) {
	console.log( 'event: onFocus', { event, editor } );
}
</script>
