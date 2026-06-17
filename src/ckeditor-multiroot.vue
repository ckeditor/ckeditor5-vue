<!--
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
-->

<template>
  <slot
    :editor="instance"
    :roots="roots"
    :data="data"
    :attributes="rootsAttributes"
    :roots-attributes="rootsAttributes"
    :add-root="addRoot"
    :remove-root="removeRoot"
  >
    <MultiRootEditorToolbar :editor="instance" />
    <MultiRootEditorEditable
      v-for="rootName in roots"
      :id="rootName"
      :key="rootName"
      :root-name="rootName"
      :editor="instance"
    />
  </slot>
</template>

<script
	setup
	lang="ts"
	generic="TEditorConstructor extends MultiRootEditorWithWatchdogRelaxedConstructor"
>
import { getCurrentInstance } from 'vue';
import type { CKEditorError, MultiRootEditor } from 'ckeditor5';
import type { ExtractEditorType } from '@ckeditor/ckeditor5-integrations-common';

import MultiRootEditorToolbar from './multiroot/MultiRootEditorToolbar.vue';
import MultiRootEditorEditable from './multiroot/MultiRootEditorEditable.vue';
import { useMultiRootEditor } from './multiroot/useMultiRootEditor.js';
import type {
	MultiRootEditorData,
	MultiRootEditorErrorDescription,
	MultiRootEditorLifecycleEvents,
	MultiRootEditorRootsAttributes,
	MultiRootEditorVModelEvents,
	MultiRootEditorWithWatchdogRelaxedConstructor,
	MultiRootProps
} from './multiroot/types.js';

type TEditor = ExtractEditorType<TEditorConstructor> & MultiRootEditor;

defineOptions( {
	name: 'CkeditorMultiRoot'
} );

const model = defineModel<MultiRootEditorData>( 'modelValue', { default: () => ( {} ) } );
const rootsAttributesModel = defineModel<MultiRootEditorRootsAttributes>( 'rootsAttributes', { default: () => ( {} ) } );

const props = withDefaults( defineProps<MultiRootProps<TEditorConstructor>>(), {
	config: () => ( {} ),
	disableWatchdog: false,
	disabled: false,
	disableTwoWayDataBinding: false
} );

const emit = defineEmits<
	& MultiRootEditorLifecycleEvents<TEditor>
	& MultiRootEditorVModelEvents<TEditor>
	& {
		error: [ error: Error | CKEditorError, description: MultiRootEditorErrorDescription<TEditor> ];
		change: [ event: unknown, editor: TEditor ];
	}
>();

const currentInstance = getCurrentInstance();
const hasErrorHandler = () => !!currentInstance?.vnode.props?.onError;

const {
	instance,
	roots,
	data,
	rootsAttributes,
	addRoot,
	removeRoot
} = useMultiRootEditor<TEditorConstructor>( {
	editor: () => props.editor,
	config: () => props.config,
	data: model,
	rootsAttributes: rootsAttributesModel,
	disabled: () => props.disabled,
	disableWatchdog: () => props.disableWatchdog,
	disableTwoWayDataBinding: () => props.disableTwoWayDataBinding,
	watchdogConfig: () => props.watchdogConfig,
	onReady: editor => emit( 'ready', editor as TEditor ),
	onDestroy: editor => emit( 'destroy', editor as TEditor ),
	onFocus: ( event, editor ) => emit( 'focus', event, editor as TEditor ),
	onBlur: ( event, editor ) => emit( 'blur', event, editor as TEditor ),
	onChange: ( event, editor ) => emit( 'change', event, editor as TEditor ),
	onUpdateData: ( data, event, editor ) => {
		emit( 'update:modelValue', data, event, editor as TEditor );
		emit( 'input', data, event, editor as TEditor );
	},
	onUpdateRootsAttributes: ( rootsAttributes, event, editor ) => {
		emit( 'update:rootsAttributes', rootsAttributes, event, editor as TEditor );
	},
	onError: ( error, description ) => {
		if ( !hasErrorHandler() ) {
			console.error( error );
		}

		emit( 'error', error, description );
	}
} );

defineExpose( {
	instance,
	roots,
	data,
	rootsAttributes,
	addRoot,
	removeRoot
} );
</script>
