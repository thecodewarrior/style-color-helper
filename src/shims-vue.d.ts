/* eslint-disable */
import {Instance as TippyInstance} from "tippy.js";

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'mdi-vue/v3'

declare global {
  export interface Element {
    _tippy?: TippyInstance
  }
}