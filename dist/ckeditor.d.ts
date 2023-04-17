/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import { type PropType } from 'vue';
import type { Editor, EditorConfig } from '@ckeditor/ckeditor5-core';
export interface CKEditorComponentData {
    instance: Editor | null;
    lastEditorData: string | null;
}
declare const _default: import("vue").DefineComponent<{
    editor: {
        type: PropType<{
            create(...args: any): Promise<Editor>;
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
    disableTwoWayDataBinding: {
        type: BooleanConstructor;
        default: boolean;
    };
}, unknown, CKEditorComponentData, {}, {
    setUpEditorEvents(): void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:modelValue" | "ready" | "destroy" | "blur" | "focus" | "input")[], "update:modelValue" | "ready" | "destroy" | "blur" | "focus" | "input", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    editor: {
        type: PropType<{
            create(...args: any): Promise<Editor>;
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
    disableTwoWayDataBinding: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & {
    "onUpdate:modelValue"?: ((...args: any[]) => any) | undefined;
    onReady?: ((...args: any[]) => any) | undefined;
    onDestroy?: ((...args: any[]) => any) | undefined;
    onBlur?: ((...args: any[]) => any) | undefined;
    onFocus?: ((...args: any[]) => any) | undefined;
    onInput?: ((...args: any[]) => any) | undefined;
}, {
    modelValue: string;
    disabled: boolean;
    config: EditorConfig;
    tagName: string;
    disableTwoWayDataBinding: boolean;
}>;
export default _default;
