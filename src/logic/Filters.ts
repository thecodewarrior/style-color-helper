import {floor, vec3, vec4} from "@/logic/math/vec";
import {Filter} from "@/logic/Filter";

export const filterTypes: Filter[] = [
  {
    id: "posterize",
    name: "Posterize",
    glsl: "color = floor(color * $0.x) / $0.y;",
    parameters: [
      {type: "float", min: 1, default: 5}
    ],
    vectorize(factor: number) {
      return [new vec4(factor, factor - 1, 0, 0)]
    },
    apply(color: vec3, factor: vec4) {
      return floor(color.times(factor.x)).div(factor.y);
    }
  },
  {
    id: "blend_normal",
    name: "Blend Normal",
    glsl: "color = $0.rgb * $0.a + color * (1. - $0.a);",
    parameters: [
      {type: "rgba", default: new vec4(1, 0, 0, 1)}
    ],
    vectorize(color: vec4) {
      return [color]
    },
    apply(color: vec3, top: vec4) {
      return top.rgb.times(top.a).plus(color.times(1 - top.a));
    }
  }
]

let registry: Record<string, Filter> = {}
for (let type of filterTypes) {
  registry[type.id] = type
}
export const filterRegistry: Record<string, Filter> = registry