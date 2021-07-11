import {vec3, vec4} from "@/logic/math/vec";

export type ParameterType =
    { type: "float", min?: number, max?: number, default: number } | // number
    { type: "int", min?: number, max?: number, default: number } | // number
    { type: "rgb", default: vec3 } | // vec3
    { type: "rgba", default: vec4 } // vec4
export type Parameter = number | vec3 | vec4

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
  parameters: ParameterType[],
  /**
   * Converts the parameter list as defined in `parameters` into the vectors that should be passed to GLSL. This allows
   * filters to merge multiple parameters into a single vector.
   */
  vectorize(...params: Parameter[]): vec4[]
  apply(color: vec3, ...params: vec4[]): vec3
}

export class ParameterizedFilter {
  readonly id: string
  readonly parameterTypes: ParameterType[]
  readonly parameters: Parameter[]

  constructor(
      readonly type: Filter
  ) {
    this.id = type.id
    this.parameterTypes = Array.of(...type.parameters)
    this.parameters = this.parameterTypes.map(it => it.default)
  }

  apply(color: vec3): vec3 {
    return this.type.apply(color, ...this.type.vectorize(...this.parameters))
  }
}

export type FilterSet = ParameterizedFilter[]