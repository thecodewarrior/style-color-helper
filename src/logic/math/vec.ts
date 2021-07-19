// this code is only used for the final value calculation, so similarity to the GLSL is prioritized over speed

import {map, zip} from "@/logic/math/ops";

export class vec4 {
  public constructor(v: number);
  public constructor(r: number, g: number, b: number, a: number);
  public constructor(rgb: vec3, a: number);
  public constructor(rgba: vec4);
  constructor(x: number | vec3 | vec4, y?: number, z?: number, w?: number) {
    if(x instanceof vec4) {
      this.r = x.r
      this.g = x.g
      this.b = x.b
      this.a = x.a
    } else if(x instanceof vec3) {
      this.r = x.r
      this.g = x.g
      this.b = x.b
      this.a = y!
    } else if(y === undefined) {
      this.r = x
      this.g = x
      this.b = x
      this.a = x
    } else {
      this.r = x
      this.g = y
      this.b = z!
      this.a = w!
    }
  }

  public r: number
  public g: number
  public b: number
  public a: number
  public get rgb(): vec3 {
    return new vec3(this.r, this.g, this.b)
  }
  public set rgb(value: vec3) {
    this.r = value.r
    this.g = value.g
    this.b = value.b
  }
  public get rgba(): vec4 {
    return new vec4(this)
  }
  public set rgba(value: vec4) {
    this.r = value.r
    this.g = value.g
    this.b = value.b
    this.a = value.a
  }
  public get x(): number {
    return this.r
  }
  public get y(): number {
    return this.g
  }
  public get z(): number {
    return this.b
  }
  public get w(): number {
    return this.a
  }

  public plus(other: vec4 | vec3): vec4 {
    if(other instanceof vec4)
      return zip(this, other, (a, b) => a + b)
    else
      return zip(this, new vec4(other, 0), (a, b) => a + b)
  }
  public minus(other: vec4 | vec3): vec4 {
    if(other instanceof vec4)
      return zip(this, other, (a, b) => a - b)
    else
      return zip(this, new vec4(other, 0), (a, b) => a - b)
  }
  public times(other: vec4 | vec3 | number): vec4 {
    if(other instanceof vec4)
      return zip(this, other, (a, b) => a * b)
    else if(other instanceof vec3)
      return zip(this, new vec4(other, 1), (a, b) => a * b)
    else
      return map(this, (v) => v * other)
  }
  public div(other: vec4 | vec3 | number): vec4 {
    if(other instanceof vec4)
      return zip(this, other, (a, b) => a / b)
    else if(other instanceof vec3)
      return zip(this, new vec4(other, 1), (a, b) => a / b)
    else
      return map(this, (v) => v / other)
  }
}

export class vec3 {
  public constructor(v: number);
  public constructor(r: number, g: number, b: number);
  public constructor(rgb: vec3);
  constructor(x: number | vec3, y?: number, z?: number) {
    if(x instanceof vec3) {
      this.r = x.r
      this.g = x.g
      this.b = x.b
    } else if(y === undefined) {
      this.r = x
      this.g = x
      this.b = x
    } else {
      this.r = x
      this.g = y
      this.b = z!
    }
  }

  public r: number
  public g: number
  public b: number
  public get rgb(): vec3 {
    return new vec3(this)
  }
  public set rgb(value: vec3) {
    this.r = value.r
    this.g = value.g
    this.b = value.b
  }
  public get x(): number {
    return this.r
  }
  public get y(): number {
    return this.g
  }
  public get z(): number {
    return this.b
  }

  public plus(other: vec3): vec3 {
    return zip(this, other, (a, b) => a + b)
  }
  public minus(other: vec3): vec3 {
    return zip(this, other, (a, b) => a - b)
  }
  public times(other: vec3 | number): vec3 {
    if(other instanceof vec3)
      return zip(this, other, (a, b) => a * b)
    else
      return map(this, (v) => v * other)
  }
  public div(other: vec3 | number): vec3 {
    if(other instanceof vec3)
      return zip(this, other, (a, b) => a / b)
    else
      return map(this, (v) => v / other)
  }
}
