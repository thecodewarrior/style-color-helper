import {vec3, vec4} from "@/logic/math/vec";
import chroma from "chroma-js";

export function map(n: number, fn: (v: number) => number): number;
export function map(n: vec4, fn: (v: number) => number): vec4;
export function map(n: vec3, fn: (v: number) => number): vec3;
export function map(v: number | vec3 | vec4, fn: (v: number) => number): number | vec3 | vec4;
export function map(v: number | vec3 | vec4, fn: (v: number) => number): number | vec3 | vec4 {
  if(v instanceof vec4) {
    return new vec4(fn(v.r), fn(v.g), fn(v.b), fn(v.a))
  } else if(v instanceof vec3) {
    return new vec3(fn(v.r), fn(v.g), fn(v.b))
  } else {
    return fn(v)
  }
}

export function zip(a: number, b: number, fn: (a: number, b: number) => number): number;
export function zip(a: vec4, b: vec4, fn: (a: number, b: number) => number): vec4;
export function zip(a: vec3, b: vec3, fn: (a: number, b: number) => number): vec3;
export function zip(a: number | vec3 | vec4, b: number | vec3 | vec4, fn: (a: number, b: number) => number): number | vec3 | vec4;
export function zip(a: number | vec3 | vec4, b: number | vec3 | vec4, fn: (a: number, b: number) => number): number | vec3 | vec4 {
  if(a instanceof vec4 && b instanceof vec4) {
    return new vec4(fn(a.r, b.r), fn(a.g, b.g), fn(a.b, b.b), fn(a.a, b.a))
  } else if(a instanceof vec3 && b instanceof vec3) {
    return new vec3(fn(a.r, b.r), fn(a.g, b.g), fn(a.b, b.b))
  } else if(typeof a === 'number') {
    return fn(a as number, b as number)
  } else {
    return map(a, value => fn(value, b as number))
  }
}

export function floor(n: number): number;
export function floor(n: vec3): vec3;
export function floor(n: vec4): vec4;
export function floor(v: number | vec3 | vec4): number | vec3 | vec4 {
  return map(v, Math.floor)
}

export function clamp(n: number, min: number, max: number): number;
export function clamp(n: vec3, min: number, max: number): vec3;
export function clamp(n: vec3, min: vec3, max: vec3): vec3;
export function clamp(n: vec4, min: number, max: number): vec4;
export function clamp(n: vec4, min: vec4, max: vec4): vec4;
export function clamp(v: number | vec3 | vec4, min: number | vec3 | vec4, max: number | vec3 | vec4): number | vec3 | vec4 {
  if(min instanceof vec3 || min instanceof vec3) { // component-wise
    let clamped = v;
    clamped = zip(clamped, min, (value, bound) => value < bound ? bound : value)
    clamped = zip(clamped, max, (value, bound) => value > bound ? bound : value)
    return clamped
  } else { // single number bound
    return map(v, (value) => Math.min(max as number, Math.max(min as number, value)))
  }
}

export function rgb2hsl(rgb: vec3): vec3 {
  let color = chroma.gl(rgb.r, rgb.g, rgb.b)
  return new vec3(...color.hsl())
}

export function hsl2rgb(hsl: vec3): vec3 {
  let color = chroma.hsl(hsl.x, hsl.y, hsl.z)
  let gl = color.gl()
  return new vec3(gl[0], gl[1], gl[2])
}
