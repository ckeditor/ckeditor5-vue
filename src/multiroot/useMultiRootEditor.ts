/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	markRaw,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	toValue,
	watch,
	type MaybeRefOrGetter,
	type Ref
} from 'vue';
import { debounce } from 'lodash-es';

import type {
	AddRootEvent,
	CKEditorError,
	DetachRootEvent,
	EditorConfig,
	EventInfo,
	InlineEditableUIView,
	ModelRootElement,
	ModelWriter,
	MultiRootEditor,
	WatchdogConfig
} from 'ckeditor5';

import {
	assignAttributesPropToMultiRootEditorConfig,
	assignInitialDataToMultirootEditorConfig,
	getInstalledCKBaseFeatures,
	type ExtractEditorType
} from '@ckeditor/ckeditor5-integrations-common';

import { appendUsageDataPluginToConfig } from '../plugins/VueIntegrationUsageDataPlugin.js';
import { useIsUnmounted } from '../composables/useIsUnmounted.js';
import { useEditorReadOnly } from '../composables/useEditorReadOnly.js';
import { cleanupOrphanEditorElements } from '../utils/cleanupOrphanEditorElements.js';
import {
	attachEditorWatchdogErrorHandler,
	destroyEditorWithWatchdog,
	resolveEditorConstructor,
	type EditorWithAttachedWatchdog
} from '../utils/wrapWithWatchdogIfPresent.js';

import { ROOT_EDITABLE_OPTIONS_ATTRIBUTE } from './constants.js';
import type {
	AddRootOptions,
	MultiRootEditorData,
	MultiRootEditorErrorDescription,
	MultiRootEditorRootsAttributes,
	MultiRootEditorWithWatchdogRelaxedConstructor
} from './types.js';

const INPUT_EVENT_DEBOUNCE_WAIT = 300;
const EDITOR_DESTROYED_BEFORE_READY_MESSAGE = 'The editor was destroyed before it became ready.';

type EditorReadyCallback<TEditor extends MultiRootEditor> = {
	resolve: ( editor: TEditor ) => void;
	reject: ( error: Error ) => void;
};

export function useMultiRootEditor<TEditorConstructor extends MultiRootEditorWithWatchdogRelaxedConstructor>(
	options: UseMultiRootEditorOptions<TEditorConstructor>
): UseMultiRootEditorResult<ExtractEditorType<TEditorConstructor> & MultiRootEditor> {
	type TEditor = ExtractEditorType<TEditorConstructor> & MultiRootEditor;

	const isUnmounted = useIsUnmounted();
	const instance = ref<EditorWithAttachedWatchdog<TEditor>>();
	const data = ref<MultiRootEditorData>( cloneData( toValue( options.data ) ) );
	const rootsAttributes = ref<MultiRootEditorRootsAttributes>(
		normalizeRootsAttributes( toValue( options.rootsAttributes ), data.value )
	);
	const roots = ref<Array<string>>( Object.keys( data.value ) );
	const shouldUpdateEditor = ref( false );
	const lastEditorData = ref<MultiRootEditorData>();
	const lastEditorRootsAttributes = ref<MultiRootEditorRootsAttributes>();

	let editorReadyCallbacks: Array<EditorReadyCallback<TEditor>> = [];

	useEditorReadOnly( instance, () => toValue( options.disabled ) );

	watch( () => toValue( options.data ), newData => {
		if ( instance.value && lastEditorData.value && areRecordsEqual( newData, lastEditorData.value ) ) {
			return;
		}

		setData( cloneData( newData ) );
	}, { deep: true } );

	watch( () => toValue( options.rootsAttributes ), newRootsAttributes => {
		const sourceRootsAttributes = cloneRootsAttributes( newRootsAttributes );
		const normalizedRootsAttributes = normalizeRootsAttributes( newRootsAttributes, data.value );
		const nextRootsAttributes = instance.value ?
			mergeRootsAttributes( rootsAttributes.value, normalizedRootsAttributes, data.value ) :
			normalizedRootsAttributes;
		const shouldEmitNormalizedRootsAttributes = !!instance.value && !areRecordsEqual( nextRootsAttributes, sourceRootsAttributes );

		if (
			instance.value &&
			lastEditorRootsAttributes.value &&
			areRecordsEqual( nextRootsAttributes, lastEditorRootsAttributes.value )
		) {
			if ( shouldEmitNormalizedRootsAttributes ) {
				setRootsAttributes( nextRootsAttributes );
				emitRootsAttributes( null, instance.value as TEditor );
			}

			return;
		}

		setRootsAttributes( nextRootsAttributes );

		if ( shouldEmitNormalizedRootsAttributes ) {
			emitRootsAttributes( null, instance.value as TEditor );
		}
	}, { deep: true } );

	watch( [ data, rootsAttributes ], () => {
		const editor = instance.value;

		if ( !editor || !shouldUpdateEditor.value ) {
			return;
		}

		shouldUpdateEditor.value = false;
		syncEditorWithState( editor );
	}, { deep: true, flush: 'post' } );

	watch( instance, async ( newInstance, _oldInstance, onCleanup ) => {
		/* istanbul ignore if -- @preserve - Defensive check, instance can only be set to an editor here. */
		if ( !newInstance ) {
			return;
		}

		let isCurrentInstance = true;
		const editor = newInstance as TEditor;
		const modelDocument = editor.model.document;
		const viewDocument = editor.editing.view.document;
		const emitDebouncedDataUpdate = debounce( ( event: EventInfo ) => {
			updateStateFromEditor( editor, event );
		}, INPUT_EVENT_DEBOUNCE_WAIT, { leading: true } );
		const onChangeDataListener = ( event: EventInfo ) => onChangeData( editor, event, emitDebouncedDataUpdate );
		const onAddRootListener = ( event: EventInfo, root: ModelRootElement ) => onAddRoot( editor, event, root );
		const onDetachRootListener = ( event: EventInfo, root: ModelRootElement ) => onDetachRoot( editor, event, root );
		const onFocusListener = ( event: EventInfo ) => options.onFocus?.( event, editor );
		const onBlurListener = ( event: EventInfo ) => options.onBlur?.( event, editor );
		const onDestroyListener = () => {
			emitDebouncedDataUpdate.cancel();
			options.onDestroy?.( editor );
		};

		modelDocument.on( 'change:data', onChangeDataListener );
		editor.on<AddRootEvent>( 'addRoot', onAddRootListener );
		editor.on<DetachRootEvent>( 'detachRoot', onDetachRootListener );
		viewDocument.on( 'focus', onFocusListener );
		viewDocument.on( 'blur', onBlurListener );
		editor.once( 'destroy', onDestroyListener );

		onCleanup( () => {
			isCurrentInstance = false;
			modelDocument.off( 'change:data', onChangeDataListener );
			editor.off( 'addRoot', onAddRootListener );
			editor.off( 'detachRoot', onDetachRootListener );
			viewDocument.off( 'focus', onFocusListener );
			viewDocument.off( 'blur', onBlurListener );
			emitDebouncedDataUpdate.cancel();
		} );

		await nextTick();

		/* istanbul ignore if -- @preserve - Instance replacement/unmount before deferred ready is a defensive race guard. */
		if ( !isCurrentInstance || isUnmounted.value || instance.value !== editor ) {
			return;
		}

		options.onReady?.( editor );

		resolveEditorReadyCallbacks( editor );
	}, { flush: 'post' } );

	onMounted( initializeEditor );

	onBeforeUnmount( async () => {
		const editor = instance.value;

		rejectEditorReadyCallbacks( new Error( EDITOR_DESTROYED_BEFORE_READY_MESSAGE ) );

		if ( !editor ) {
			return;
		}

		instance.value = undefined;
		forceAssignFakeEditableElements( editor );

		await destroyEditorWithWatchdog( editor );
	} );

	async function initializeEditor() {
		const creationData = cloneData( data.value );
		const creationRootsAttributes = cloneRootsAttributes( rootsAttributes.value );
		const Constructor = resolveEditorConstructor(
			toValue( options.editor ),
			!!toValue( options.disableWatchdog ),
			toValue( options.watchdogConfig )
		);

		try {
			const editor = await createEditor( Constructor, creationData, creationRootsAttributes );

			if ( isUnmounted.value ) {
				rejectEditorReadyCallbacks( new Error( EDITOR_DESTROYED_BEFORE_READY_MESSAGE ) );
				forceAssignFakeEditableElements( editor );
				await destroyEditorWithWatchdog( editor );
				return;
			}

			const watchdog = attachEditorWatchdogErrorHandler( editor, {
				isUnmounted: () => isUnmounted.value,
				onError: ( { error, watchdog, editor, causesRestart } ) => {
					reportError( error, {
						phase: 'runtime',
						watchdog,
						editor,
						causesRestart
					} );
				}
			} );

			if ( watchdog ) {
				watchdog.on( 'restart', () => {
					try {
						/* istanbul ignore else -- @preserve - Restart is only handled after an editor instance is assigned. */
						if ( instance.value ) {
							cleanupOrphanEditorElements( instance.value );
						}
					} catch ( err ) {
						console.error( err );
					}

					/* istanbul ignore if -- @preserve - Restart without an editor or after unmount is a watchdog edge case. */
					if ( isUnmounted.value || !watchdog.editor ) {
						return;
					}

					const restartedEditor = watchdog.editor as EditorWithAttachedWatchdog<TEditor>;

					instance.value = markRaw( restartedEditor );
					syncStateFromEditor( restartedEditor );
					emitData( null, restartedEditor );
					emitRootsAttributes( null, restartedEditor );
				} );
			}

			instance.value = markRaw( editor );

			if (
				areRecordsEqual( data.value, creationData ) &&
				areRecordsEqual( rootsAttributes.value, creationRootsAttributes )
			) {
				syncStateFromEditor( editor );
			} else {
				syncEditorWithState( editor );
				syncStateFromEditor( editor );
			}
		} catch ( error: any ) {
			rejectEditorReadyCallbacks( error );

			/* istanbul ignore if -- @preserve - Initialization errors after unmount are intentionally ignored. */
			if ( isUnmounted.value ) {
				return;
			}

			reportError( error, {
				phase: 'initialization'
			} );
		}
	}

	async function createEditor(
		Constructor: TEditorConstructor,
		initialData: MultiRootEditorData,
		initialRootsAttributes: MultiRootEditorRootsAttributes
	): Promise<EditorWithAttachedWatchdog<TEditor>> {
		let editorConfig = assignAttributesPropToMultiRootEditorConfig(
			initialRootsAttributes,
			{ ...toValue( options.config ) }
		);

		editorConfig = appendUsageDataPluginToConfig( editorConfig );

		const {
			initialData: mergedInitialData,
			...mergedConfig
		} = assignInitialDataToMultirootEditorConfig( initialData, editorConfig ) as EditorConfig & {
			initialData?: MultiRootEditorData;
		};
		const supports = getInstalledCKBaseFeatures();
		const Editor = Constructor as unknown as {
			create( data: MultiRootEditorData, config: EditorConfig ): Promise<EditorWithAttachedWatchdog<TEditor>>;
			create( config: EditorConfig ): Promise<EditorWithAttachedWatchdog<TEditor>>;
		};

		return await (
			supports.elementConfigAttachment ?
				Editor.create( { ...mergedConfig, initialData: mergedInitialData } ) :
				Editor.create( mergedInitialData as MultiRootEditorData, mergedConfig )
		);
	}

	function syncEditorWithState( editor: TEditor ) {
		const desiredData = cloneData( data.value );
		const desiredRootsAttributes = normalizeRootsAttributes( rootsAttributes.value, desiredData );
		const editorData = editor.getFullData();
		const editorRootsAttributes = normalizeRootsAttributes( editor.getRootsAttributes(), editorData );
		const { addedKeys: newRoots, removedKeys: removedRoots } = getRecordDiff( editorData, desiredData );
		const modifiedRoots = Object.keys( desiredData ).filter( rootName =>
			editorData[ rootName ] !== undefined && editorData[ rootName ] !== desiredData[ rootName ]
		);
		const rootsWithChangedAttributes = Object.keys( desiredRootsAttributes ).filter( rootName =>
			editorData[ rootName ] !== undefined &&
			!areRecordsEqual( editorRootsAttributes[ rootName ], desiredRootsAttributes[ rootName ] )
		);

		rootsAttributes.value = desiredRootsAttributes;

		editor.model.change( writer => {
			handleNewRoots( editor, newRoots, desiredData, desiredRootsAttributes );
			handleRemovedRoots( editor, removedRoots );

			if ( modifiedRoots.length ) {
				updateEditorData( editor, modifiedRoots, desiredData );
			}

			if ( rootsWithChangedAttributes.length ) {
				updateEditorAttributes( editor, writer, rootsWithChangedAttributes, desiredRootsAttributes );
			}
		} );
	}

	function syncStateFromEditor( editor: TEditor ) {
		data.value = cloneData( editor.getFullData() );
		rootsAttributes.value = normalizeRootsAttributes( editor.getRootsAttributes(), data.value );
		roots.value = Object.keys( data.value );
	}

	function onChangeData(
		editor: TEditor,
		event: EventInfo,
		emitDebouncedDataUpdate: ( event: EventInfo ) => void
	) {
		emitDebouncedDataUpdate( event );

		options.onChange?.( event, editor );
	}

	function updateStateFromEditor( editor: TEditor, event: EventInfo | null ) {
		if ( toValue( options.disableTwoWayDataBinding ) || isUnmounted.value ) {
			return;
		}

		const editorData = cloneData( editor.getFullData() );
		const editorRootsAttributes = normalizeRootsAttributes( editor.getRootsAttributes(), editorData );
		const shouldEmitData = !areRecordsEqual( data.value, editorData );
		const shouldEmitRootsAttributes = !areRecordsEqual( rootsAttributes.value, editorRootsAttributes );

		data.value = editorData;
		rootsAttributes.value = editorRootsAttributes;
		roots.value = Object.keys( editorData );
		lastEditorData.value = cloneData( editorData );
		lastEditorRootsAttributes.value = cloneRootsAttributes( editorRootsAttributes );

		if ( shouldEmitData ) {
			emitData( event, editor );
		}

		if ( shouldEmitRootsAttributes ) {
			emitRootsAttributes( event, editor );
		}
	}

	function onAddRoot( editor: TEditor, event: EventInfo, root: ModelRootElement ) {
		const rootName = root.rootName;

		if ( !toValue( options.disableTwoWayDataBinding ) ) {
			data.value = {
				...data.value,
				[ rootName ]: editor.getData( { rootName } )
			};

			rootsAttributes.value = normalizeRootsAttributes( {
				...rootsAttributes.value,
				[ rootName ]: editor.getRootAttributes( rootName )
			}, data.value );

			emitData( event, editor );
			emitRootsAttributes( event, editor );
		}

		roots.value = unique( [ ...roots.value, rootName ] );
	}

	function onDetachRoot( editor: TEditor, event: EventInfo, root: ModelRootElement ) {
		const rootName = root.rootName;

		if ( !toValue( options.disableTwoWayDataBinding ) ) {
			const newData = { ...data.value };
			const newRootsAttributes = { ...rootsAttributes.value };

			delete newData[ rootName ];
			delete newRootsAttributes[ rootName ];

			data.value = newData;
			rootsAttributes.value = newRootsAttributes;

			emitData( event, editor );
			emitRootsAttributes( event, editor );
		}

		roots.value = roots.value.filter( currentRootName => currentRootName !== rootName );
	}

	function emitData( event: EventInfo | null, editor: TEditor ) {
		lastEditorData.value = cloneData( data.value );
		options.onUpdateData?.( cloneData( data.value ), event, editor );
	}

	function emitRootsAttributes( event: EventInfo | null, editor: TEditor ) {
		lastEditorRootsAttributes.value = cloneRootsAttributes( rootsAttributes.value );
		options.onUpdateRootsAttributes?.( cloneRootsAttributes( rootsAttributes.value ), event, editor );
	}

	function reportError( error: Error | CKEditorError, description: MultiRootEditorErrorDescription<TEditor> ) {
		/* istanbul ignore else -- @preserve - The Vue component always provides an error callback. */
		if ( options.onError ) {
			options.onError( error, description );
		} else {
			console.error( error );
		}
	}

	function setData( newData: MultiRootEditorData ) {
		shouldUpdateEditor.value = true;
		data.value = cloneData( newData );
		rootsAttributes.value = normalizeRootsAttributes( rootsAttributes.value, data.value );

		if ( !instance.value ) {
			roots.value = Object.keys( data.value );
		}
	}

	function setRootsAttributes( newRootsAttributes: MultiRootEditorRootsAttributes ) {
		shouldUpdateEditor.value = true;
		rootsAttributes.value = normalizeRootsAttributes( newRootsAttributes, data.value );
	}

	async function addRoot( { name, data: rootData = '', attributes = {}, editableOptions, ...rootOptions }: AddRootOptions ) {
		const editor = await waitForEditor();
		const supports = getInstalledCKBaseFeatures();

		editor.model.change( () => {
			const mappedAttributes = {
				...attributes,
				...editableOptions && {
					[ ROOT_EDITABLE_OPTIONS_ATTRIBUTE ]: editableOptions
				}
			};

			for ( const key of Object.keys( mappedAttributes ) ) {
				editor.registerRootAttribute( key );
			}

			let options: Record<string, unknown> = {
				isUndoable: true,
				...rootOptions
			};

			if ( supports.rootsConfigEntry ) {
				options = {
					...options,
					initialData: rootData,
					modelAttributes: mappedAttributes
				};
			} else {
				options = {
					...options,
					data: rootData,
					attributes: mappedAttributes
				};
			}

			editor.addRoot( name, options );
		} );
	}

	async function removeRoot( name: string ) {
		const editor = await waitForEditor();

		editor.model.change( () => {
			editor.detachRoot( name, true );
		} );
	}

	function waitForEditor(): Promise<TEditor> {
		if ( instance.value ) {
			return Promise.resolve( instance.value as TEditor );
		}

		if ( isUnmounted.value ) {
			return Promise.reject( new Error( EDITOR_DESTROYED_BEFORE_READY_MESSAGE ) );
		}

		return new Promise( ( resolve, reject ) => {
			editorReadyCallbacks.push( { resolve, reject } );
		} );
	}

	function resolveEditorReadyCallbacks( editor: TEditor ) {
		editorReadyCallbacks.forEach( ( { resolve } ) => resolve( editor ) );
		editorReadyCallbacks = [];
	}

	function rejectEditorReadyCallbacks( error: Error ) {
		editorReadyCallbacks.forEach( ( { reject } ) => reject( error ) );
		editorReadyCallbacks = [];
	}

	return {
		instance: instance as Ref<EditorWithAttachedWatchdog<TEditor> | undefined>,
		roots,
		data,
		rootsAttributes,
		setData,
		setRootsAttributes,
		addRoot,
		removeRoot
	};
}

function handleNewRoots(
	editor: MultiRootEditor,
	rootNames: Array<string>,
	data: MultiRootEditorData,
	rootsAttributes: MultiRootEditorRootsAttributes
) {
	const supports = getInstalledCKBaseFeatures();

	for ( const rootName of rootNames ) {
		// The root may already exist in the model (e.g. it was detached earlier), but calling
		// `getRootAttributes()` for a root that is not in the model throws `get-root-attributes-missing-root`.
		const existingRoot = editor.model.document.getRoot( rootName );
		const rootAttributes = {
			...existingRoot && editor.getRootAttributes( rootName ),
			...rootsAttributes[ rootName ]
		};
		const rootData = data[ rootName ];

		for ( const key of Object.keys( rootAttributes ) ) {
			editor.registerRootAttribute( key );
		}

		let options: Record<string, unknown> = {
			isUndoable: true
		};

		if ( supports.rootsConfigEntry ) {
			options = {
				...options,
				initialData: rootData,
				modelAttributes: rootAttributes
			};
		} else {
			options = {
				...options,
				data: rootData,
				attributes: rootAttributes
			};
		}

		editor.addRoot( rootName, options );
	}
}

function handleRemovedRoots( editor: MultiRootEditor, rootNames: Array<string> ) {
	for ( const rootName of rootNames ) {
		editor.detachRoot( rootName, true );
	}
}

function updateEditorData( editor: MultiRootEditor, rootNames: Array<string>, data: MultiRootEditorData ) {
	const dataToUpdate = rootNames.reduce<MultiRootEditorData>(
		( result, rootName ) => ( { ...result, [ rootName ]: data[ rootName ] } ),
		Object.create( null )
	);

	editor.data.set( dataToUpdate, { suppressErrorInCollaboration: true } as any );
}

function updateEditorAttributes(
	editor: MultiRootEditor,
	writer: ModelWriter,
	rootNames: Array<string>,
	rootsAttributes: MultiRootEditorRootsAttributes
) {
	for ( const rootName of rootNames ) {
		const rootAttributes = rootsAttributes[ rootName ];

		for ( const key of Object.keys( rootAttributes ) ) {
			editor.registerRootAttribute( key );
		}

		const root = editor.model.document.getRoot( rootName );

		/* istanbul ignore if -- @preserve - Attribute updates are only requested for existing roots. */
		if ( !root ) {
			continue;
		}

		writer.setAttributes( rootAttributes, root );
	}
}

function forceAssignFakeEditableElements( editor: MultiRootEditor ) {
	const initializeEditableWithFakeElement = ( editable: InlineEditableUIView ) => {
		if ( editable.name && !editor.editing.view.getDomRoot( editable.name ) ) {
			editor.editing.view.attachDomRoot( document.createElement( 'div' ), editable.name );
		}
	};

	Object
		.values( editor.ui.view.editables )
		.forEach( initializeEditableWithFakeElement );
}

function normalizeRootsAttributes(
	rootsAttributes: MultiRootEditorRootsAttributes | undefined,
	data: MultiRootEditorData
): MultiRootEditorRootsAttributes {
	/* istanbul ignore next -- @preserve - Direct composable usage may omit roots attributes. */
	const source = rootsAttributes ?? {};

	return Object.keys( data ).reduce<MultiRootEditorRootsAttributes>( ( result, rootName ) => {
		result[ rootName ] = { ...source[ rootName ] };

		return result;
	}, Object.create( null ) );
}

function mergeRootsAttributes(
	previousRootsAttributes: MultiRootEditorRootsAttributes,
	nextRootsAttributes: MultiRootEditorRootsAttributes,
	data: MultiRootEditorData
): MultiRootEditorRootsAttributes {
	return Object.keys( data ).reduce<MultiRootEditorRootsAttributes>( ( result, rootName ) => {
		result[ rootName ] = {
			...previousRootsAttributes[ rootName ],
			...nextRootsAttributes[ rootName ]
		};

		return result;
	}, Object.create( null ) );
}

function cloneData( data: MultiRootEditorData | undefined ): MultiRootEditorData {
	return {
		...data
	};
}

function cloneRootsAttributes(
	rootsAttributes: MultiRootEditorRootsAttributes | undefined
): MultiRootEditorRootsAttributes {
	/* istanbul ignore next -- @preserve - Direct composable usage may omit roots attributes. */
	return Object.keys( rootsAttributes ?? {} ).reduce<MultiRootEditorRootsAttributes>( ( result, rootName ) => {
		result[ rootName ] = {
			...rootsAttributes![ rootName ]
		};

		return result;
	}, Object.create( null ) );
}

function getRecordDiff( previousState: Record<string, unknown>, newState: Record<string, unknown> ) {
	const previousStateKeys = Object.keys( previousState );
	const newStateKeys = Object.keys( newState );

	return {
		addedKeys: newStateKeys.filter( key => !previousStateKeys.includes( key ) ),
		removedKeys: previousStateKeys.filter( key => !newStateKeys.includes( key ) )
	};
}

function areRecordsEqual( first: Record<string, unknown>, second: Record<string, unknown> ): boolean {
	return JSON.stringify( first ) === JSON.stringify( second );
}

function unique<TValue>( values: Array<TValue> ): Array<TValue> {
	return [ ...new Set( values ) ];
}

export type UseMultiRootEditorOptions<TEditorConstructor extends MultiRootEditorWithWatchdogRelaxedConstructor> = {
	editor: MaybeRefOrGetter<TEditorConstructor>;
	data: MaybeRefOrGetter<MultiRootEditorData>;
	rootsAttributes?: MaybeRefOrGetter<MultiRootEditorRootsAttributes | undefined>;
	config?: MaybeRefOrGetter<EditorConfig | undefined>;
	disabled?: MaybeRefOrGetter<boolean | undefined>;
	watchdogConfig?: MaybeRefOrGetter<WatchdogConfig | undefined>;
	disableWatchdog?: MaybeRefOrGetter<boolean | undefined>;
	disableTwoWayDataBinding?: MaybeRefOrGetter<boolean | undefined>;
	onReady?: ( editor: ExtractEditorType<TEditorConstructor> & MultiRootEditor ) => void;
	onDestroy?: ( editor: ExtractEditorType<TEditorConstructor> & MultiRootEditor ) => void;
	onChange?: ( event: EventInfo, editor: ExtractEditorType<TEditorConstructor> & MultiRootEditor ) => void;
	onFocus?: ( event: EventInfo, editor: ExtractEditorType<TEditorConstructor> & MultiRootEditor ) => void;
	onBlur?: ( event: EventInfo, editor: ExtractEditorType<TEditorConstructor> & MultiRootEditor ) => void;
	onUpdateData?: (
		data: MultiRootEditorData,
		event: EventInfo | null,
		editor: ExtractEditorType<TEditorConstructor> & MultiRootEditor
	) => void;
	onUpdateRootsAttributes?: (
		rootsAttributes: MultiRootEditorRootsAttributes,
		event: EventInfo | null,
		editor: ExtractEditorType<TEditorConstructor> & MultiRootEditor
	) => void;
	onError?: (
		error: Error | CKEditorError,
		description: MultiRootEditorErrorDescription<ExtractEditorType<TEditorConstructor> & MultiRootEditor>
	) => void;
};

export type UseMultiRootEditorResult<TEditor extends MultiRootEditor> = {
	instance: Ref<EditorWithAttachedWatchdog<TEditor> | undefined>;
	roots: Ref<Array<string>>;
	data: Ref<MultiRootEditorData>;
	rootsAttributes: Ref<MultiRootEditorRootsAttributes>;
	setData( data: MultiRootEditorData ): void;
	setRootsAttributes( rootsAttributes: MultiRootEditorRootsAttributes ): void;
	addRoot( options: AddRootOptions ): Promise<void>;
	removeRoot( name: string ): Promise<void>;
};
