import {vec3, vec4} from "@/logic/math/vec";
import {guid} from "@/utils";
import VueStore from "vue-class-store";

export type NumberControl = {
  name: string, type: "number", default: number,
  min?: number, max?: number, step?: number, integer?: boolean
}
export type SliderControl = {
  name: string, type: "slider", default: number,
  min: number, max: number, snap: number | 'any', step: number,
  precision: number, suffix?: string
}
export type ColorControl = {
  name: string, type: "color", default: vec3
}

export type FilterControl = NumberControl | SliderControl | ColorControl
export type ControlValue = number | vec3 | vec4

/**
 * A filter definition
 */
export type Filter = {
  id: string,
  name: string,
  /**
   * A GLSL string which modifies the value of `color`. Use `$<num>` for input vectors. The vectors count will
   * automatically be calculated based on the largest of these.
   *
   * e.g. `"color = color * $0.rgb;"`
   *
   * Each filter is isolated in its own block, so declaring variables is valid.
   */
  glsl: string,
  /**
   * The list of parameters that should be displayed.
   */
  controls: FilterControl[],
  /**
   * Converts the parameter list as defined in `parameters` into the vectors that should be passed to GLSL. This allows
   * filters to merge multiple parameters into a single vector.
   */
  vectorize(...params: ControlValue[]): vec4[]
  apply(color: vec3, ...params: vec4[]): vec3
}

@VueStore
export class ParameterizedFilter {
  readonly id: string = guid()
  readonly parameters: FilterControl[]
  readonly values: ControlValue[]
  visible: boolean = true

  constructor(
      readonly filter: Filter
  ) {
    this.parameters = Array.of(...filter.controls)
    this.values = this.parameters.map(it => it.default)
  }

  apply(color: vec3): vec3 {
    return this.filter.apply(color, ...this.filter.vectorize(...this.values))
  }
}