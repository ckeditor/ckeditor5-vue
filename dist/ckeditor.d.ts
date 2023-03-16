/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import { type PropType } from 'vue';
import type { Editor, DataApi, EditorConfig } from '@ckeditor/ckeditor5-core';
type EditorInstance = Editor & DataApi;
export interface CKEditorComponentData {
    instance: EditorInstance | null;
    lastEditorData: string | null;
}
declare const _default: import("vue").DefineComponent<{
    editor: {
        type: PropType<{
            create(...args: any): Promise<EditorInstance>;
        }>;
        required: true;
    };
    config: {
        type: PropType<EditorConfig>;
        default: () => {};
    };
    modelValue: {
        type: StringConstructor;
        default: string;
    };
    tagName: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}, unknown, CKEditorComponentData, {}, {
    setUpEditorEvents(): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    editor: {
        type: PropType<{
            create(...args: any): Promise<EditorInstance>;
        }>;
        required: true;
    };
    config: {
        type: PropType<EditorConfig>;
        default: () => {};
    };
    modelValue: {
        type: StringConstructor;
        default: string;
    };
    tagName: {
        type: StringConstructor;
        default: string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>>, {
    modelValue: string;
    disabled: boolean;
    config: EditorConfig;
    tagName: string;
}>;
export default _default;
