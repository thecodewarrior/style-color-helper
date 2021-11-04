// this code is only used for the final value calculation, so similarity to the GLSL is prioritized over speed

import {map, zip} from "@/logic/math/ops";

export class vec4 {
  public constructor(v: number);
  public constructor(x: number, y: number, z: number, w: number);
  public constructor(rgb: vec3, a: number);
  public constructor(rgba: vec4);
  public constructor(rgba: [number, number, number, number]);
  constructor(x: number | vec3 | vec4 | [number, number, number, number], y?: number, z?: number, w?: number) {
    if(Array.isArray(x)) {
      this.x = x[0]
      this.y = x[1]
      this.z = x[2]
      this.w = x[3]
    } else if(x instanceof vec4) {
      this.x = x.r
      this.y = x.g
      this.z = x.b
      this.w = x.a
    } else if(x instanceof vec3) {
      this.x = x.r
      this.y = x.g
      this.z = x.b
      this.w = y!
    } else if(y === undefined) {
      this.x = x
      this.y = x
      this.z = x
      this.w = x
    } else {
      this.x = x
      this.y = y
      this.z = z!
      this.w = w!
    }
  }

  public x: number
  public y: number
  public z: number
  public w: number
  public get xyz(): vec3 {
    return new vec3(this.x, this.y, this.z)
  }
  public set xyz(value: vec3) {
    this.x = value.x
    this.y = value.y
    this.z = value.z
  }
  public get rgb(): vec3 {
    return this.xyz
  }
  public set rgb(value: vec3) {
    this.xyz = value
  }
  public get xyzw(): vec4 {
    return new vec4(this)
  }
  public set xyzw(value: vec4) {
    this.x = value.x
    this.y = value.y
    this.z = value.z
    this.w = value.w
  }
  public get rgba(): vec4 {
    return this.xyzw
  }
  public set rgba(value: vec4) {
    this.xyzw = value
  }
  public get r(): number {
    return this.x
  }
  public set r(value: number) {
    this.x = value
  }
  public get g(): number {
    return this.y
  }
  public set g(value: number) {
    this.y = value
  }
  public get b(): number {
    return this.z
  }
  public set b(value: number) {
    this.z = value
  }
  public get a(): number {
    return this.w
  }
  public set a(value: number) {
    this.w = value
  }

  public plus(other: vec4 | vec3): vec4 {
    let x = other instanceof vec3 ? new vec4(other, 0) : other
    return zip(this, x, (a, b) => a + b)
  }
  public minus(other: vec4 | vec3): vec4 {
    let x = other instanceof vec3 ? new vec4(other, 0) : other
    return zip(this, x, (a, b) => a - b)
  }
  public times(other: vec4 | vec3 | number): vec4 {
    let x = typeof other === 'number' ? other : other instanceof vec3 ? new vec4(other, 0) : other
    return zip(this, x, (a, b) => a * b) as vec4
  }
  public div(other: vec4 | vec3 | number): vec4 {
    let x = typeof other === 'number' ? other : other instanceof vec3 ? new vec4(other, 0) : other
    return zip(this, x, (a, b) => a / b) as vec4
  }
}

export class vec3 {
  public constructor(v: number);
  public constructor(x: number, y: number, z: number);
  public constructor(rgb: vec3);
  public constructor(rgb: [number, number, number]);
  constructor(x: number | vec3 | [number, number, number], y?: number, z?: number) {
    if(Array.isArray(x)) {
      this.x = x[0]
      this.y = x[1]
      this.z = x[2]
    } else if(x instanceof vec3) {
      this.x = x.r
      this.y = x.g
      this.z = x.b
    } else if(y === undefined) {
      this.x = x
      this.y = x
      this.z = x
    } else {
      this.x = x
      this.y = y
      this.z = z!
    }
  }

  public x: number
  public y: number
  public z: number
  public get xyz(): vec3 {
    return new vec3(this)
  }
  public set xyz(value: vec3) {
    this.x = value.x
    this.y = value.y
    this.z = value.z
  }
  public get rgb(): vec3 {
    return this.xyz
  }
  public set rgb(value: vec3) {
    this.xyz = value
  }
  public get r(): number {
    return this.x
  }
  public set r(value: number) {
    this.x = value
  }
  public get g(): number {
    return this.y
  }
  public set g(value: number) {
    this.y = value
  }
  public get b(): number {
    return this.z
  }
  public set b(value: number) {
    this.z = value
  }

  public plus(other: vec3 | number): vec3 {
    return zip(this, other, (a, b) => a + b) as vec3
  }
  public minus(other: vec3 | number): vec3 {
    return zip(this, other, (a, b) => a - b) as vec3
  }
  public times(other: vec3 | number): vec3 {
    return zip(this, other, (a, b) => a * b) as vec3
  }
  public div(other: vec3 | number): vec3 {
    return zip(this, other, (a, b) => a / b) as vec3
  }
}
