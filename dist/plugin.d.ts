/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import * as Vue from 'vue';
import CKEditorComponent from './ckeditor';
declare const _default: {
    /**
     * Installs the plugin, registering the `<ckeditor>` component.
     *
     * @param app The application instance.
     */
    install(app: Vue.App): void;
    component: Vue.DefineComponent<{
        editor: {
            type: Vue.PropType<{
                create(...args: any): Promise<import("@ckeditor/ckeditor5-core").Editor>;
            }>;
            required: true;
        };
        config: {
            type: Vue.PropType<import("@ckeditor/ckeditor5-core").EditorConfig>;
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
    }, unknown, import("./ckeditor").CKEditorComponentData, {}, {
        setUpEditorEvents(): void;
    }, Vue.ComponentOptionsMixin, Vue.ComponentOptionsMixin, ("update:modelValue" | "ready" | "destroy" | "blur" | "focus" | "input")[], "update:modelValue" | "ready" | "destroy" | "blur" | "focus" | "input", Vue.VNodeProps & Vue.AllowedComponentProps & Vue.ComponentCustomProps, Readonly<Vue.ExtractPropTypes<{
        editor: {
            type: Vue.PropType<{
                create(...args: any): Promise<import("@ckeditor/ckeditor5-core").Editor>;
            }>;
            required: true;
        };
        config: {
            type: Vue.PropType<import("@ckeditor/ckeditor5-core").EditorConfig>;
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
        config: import("@ckeditor/ckeditor5-core").EditorConfig;
        tagName: string;
        disableTwoWayDataBinding: boolean;
    }>;
};
export default _default;
declare module 'vue' {
    interface GlobalComponents {
        Ckeditor: typeof CKEditorComponent;
    }
}
