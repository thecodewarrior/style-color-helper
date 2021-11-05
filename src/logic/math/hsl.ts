import {vec3} from "@/logic/math/vec";
import {min as minOp, max as maxOp} from "@/logic/math/ops";

// https://stackoverflow.com/a/9493060

// language=GLSL
export const hsl2rgb_glsl = `
    float hue2rgb(float p, float q, float t) {
        if(t < 0.) t += 1.;
        if(t > 1.) t -= 1.;
        if(t < 1./6.) return p + (q - p) * 6. * t;
        if(t < 1./2.) return q;
        if(t < 2./3.) return p + (q - p) * (2./3. - t) * 6.;
        return p;
    }

    vec3 hsl2rgb(vec3 c){
        float h = c.x, s = c.y, l = c.z;
        float r, g, b;

        if(s == 0.) {
            r = g = b = l; // achromatic
        } else {
            float q = l < 0.5 ? l * (1. + s) : l + s - l * s;
            float p = 2. * l - q;
            r = hue2rgb(p, q, h + 1./3.);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1./3.);
        }

        return vec3(r, g, b);
    }
`

function hue2rgb(p: number, q: number, t: number): number {
  if(t < 0.) t += 1.;
  if(t > 1.) t -= 1.;
  if(t < 1./6.) return p + (q - p) * 6. * t;
  if(t < 1./2.) return q;
  if(t < 2./3.) return p + (q - p) * (2./3. - t) * 6.;
  return p;
}

export function hsl2rgb(c: vec3): vec3 {
  let h = c.x, s = c.y, l = c.z;
  let r, g, b;

  if(s == 0.) {
    r = g = b = l; // achromatic
  } else {
    let q = l < 0.5 ? l * (1. + s) : l + s - l * s;
    let p = 2. * l - q;
    r = hue2rgb(p, q, h + 1./3.);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1./3.);
  }

  return new vec3(r, g, b);
}

// language=GLSL
export const rgb2hsl_glsl = `
    vec3 rgb2hsl(vec3 c) {
        float min = min(c.r, min(c.g, c.b));
        float max = max(c.r, max(c.g, c.b));
        float l = (max + min) / 2.;
        float s, h = 0.;

        if(max == min) {
            h = s = 0.; // achromatic
        } else {
            float d = max - min;
            s = l > 0.5 ? d / (2. - max - min) : d / (max + min);
            if(c.r == max) h = (c.g - c.b) / d + (c.g < c.b ? 6. : 0.);
            else if(c.g == max) h = (c.b - c.r) / d + 2.;
            else if(c.b == max) h = (c.r - c.g) / d + 4.;
            h /= 6.;
        }

        return vec3(h, s, l);
    }
`

export function rgb2hsl(c: vec3): vec3 {
  let min = minOp(c.r, minOp(c.g, c.b));
  let max = maxOp(c.r, maxOp(c.g, c.b));
  let l = (max + min) / 2.;
  let s, h = 0.;

  if(max == min) {
    h = s = 0.; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2. - max - min) : d / (max + min);
    if(c.r == max) h = (c.g - c.b) / d + (c.g < c.b ? 6. : 0.);
    else if(c.g == max) h = (c.b - c.r) / d + 2.;
    else if(c.b == max) h = (c.r - c.g) / d + 4.;
    h /= 6.;
  }

  return new vec3(h, s, l);
}