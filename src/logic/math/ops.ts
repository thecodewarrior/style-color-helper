import {vec3, vec4} from "@/logic/math/vec";
import chroma from "chroma-js";

type V = number | vec3 | vec4

export function map<T extends V>(v: T, fn: (v: number) => number): T {
  if(v instanceof vec4) {
    return new vec4(fn(v.r), fn(v.g), fn(v.b), fn(v.a)) as T
  } else if(v instanceof vec3) {
    return new vec3(fn(v.r), fn(v.g), fn(v.b)) as T
  } else {
    return fn(v as number) as T
  }
}

export function zip<T extends V>(a: T, b: T | number, fn: (a: number, b: number) => number): T {
  if(a instanceof vec4 && b instanceof vec4) {
    return new vec4(fn(a.r, b.r), fn(a.g, b.g), fn(a.b, b.b), fn(a.a, b.a)) as T
  } else if(a instanceof vec3 && b instanceof vec3) {
    return new vec3(fn(a.r, b.r), fn(a.g, b.g), fn(a.b, b.b)) as T
  } else if(typeof a === 'number') {
    return fn(a as number, b as number) as T
  } else {
    return map(a, value => fn(value, b as number))
  }
}

export function floor<T extends V>(v: T): T {
  return map(v, Math.floor)
}

export function min<T extends V>(a: T, b: T): T {
  return zip(a, b, (a, b) => Math.min(a, b));
}

export function max<T extends V>(a: T, b: T): T {
  return zip(a, b, (a, b) => Math.max(a, b));
}

export function clamp<T extends V>(v: T, min: T | number, max: T | number): T {
  if(min instanceof vec3 || min instanceof vec3) { // component-wise
    let clamped = v;
    clamped = zip(clamped, min, (value, bound) => value < bound ? bound : value)
    clamped = zip(clamped, max, (value, bound) => value > bound ? bound : value)
    return clamped
  } else { // single number bound
    return map(v, (value) => Math.min(max as number, Math.max(min as number, value)))
  }
}

// export function rgb2hsl(rgb: vec3): vec3 {
//   let color = chroma.gl(rgb.r, rgb.g, rgb.b)
//   return new vec3(...color.hsl())
// }
//
// export function hsl2rgb(hsl: vec3): vec3 {
//   let color = chroma.hsl(hsl.x, hsl.y, hsl.z)
//   let gl = color.gl()
//   return new vec3(gl[0], gl[1], gl[2])
// }
