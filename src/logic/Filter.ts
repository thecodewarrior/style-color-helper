import {vec3, vec4} from "@/logic/math/vec";

export type FloatParameter = { name: string, type: "float", min?: number, max?: number, default: number } // number
export type IntParameter   = { name: string, type: "int", min?: number, max?: number, default: number } // number
export type RgbParameter   = { name: string, type: "rgb", default: vec3 } // vec3
export type RgbaParameter  = { name: string, type: "rgba", default: vec4 } // vec4


export type Parameter = FloatParameter | IntParameter | RgbParameter | RgbaParameter
export type ParameterValue = number | vec3 | vec4

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
  parameters: Parameter[],
  /**
   * Converts the parameter list as defined in `parameters` into the vectors that should be passed to GLSL. This allows
   * filters to merge multiple parameters into a single vector.
   */
  vectorize(...params: ParameterValue[]): vec4[]
  apply(color: vec3, ...params: vec4[]): vec3
}

export class ParameterizedFilter {
  readonly id: string
  readonly parameters: Parameter[]
  readonly values: ParameterValue[]

  constructor(
      readonly filter: Filter
  ) {
    this.id = filter.id
    this.parameters = Array.of(...filter.parameters)
    this.values = this.parameters.map(it => it.default)
  }

  apply(color: vec3): vec3 {
    return this.filter.apply(color, ...this.filter.vectorize(...this.values))
  }
}

export type FilterSet = ParameterizedFilter[]