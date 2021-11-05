import {vec3, vec4} from "@/logic/math/vec";
import {Filter} from "@/logic/Filter";
import {clamp, floor} from "@/logic/math/ops";
import {hsl2rgb, rgb2hsl} from "@/logic/math/hsl";

// complete:
//  - posterize
//  - brightness/contrast
//
// todo:
//  # dani
//  + normal
//  - multiply
//  - additive
//  - color burn
//  - color dodge
//  - reflect
//  - glow
//  - overlay
//  - difference
//  - negation
//  - lighten
//  - darken
//  - screen
//  - xor
//  # css
//  -
//  -
//  # me
//  - adjust HSL (±H, ±S, ±L)
//  - set hue
//  - set saturation
//  - set lightness

export const filterMenu: string[] = [
  "posterize",
  "brightness_contrast",

  "blend_normal",
]

export const filterRegistry: Record<string, Filter> = {
  // artistic filters
  "posterize": {
    id: "posterize",
    name: "Posterize",
    glsl: "color = floor(color * $0.x) / $0.y;",
    controls: [
      {name: "Levels", type: "number", default: 5, min: 2, max: 255, step: 1}
    ],
    vectorize(factor: number) {
      return [new vec4(factor + 0.0001, factor + 0.0001 - 1, 0, 0)]
    },
    apply(color: vec3, factor: vec4) {
      return floor(color.times(factor.x)).div(factor.y);
    }
  },
  "brightness_contrast": {
    id: "brightness_contrast",
    name: "Brightness/contrast",
    glsl: `
vec3 hsl = rgb2hsl(color);
float x = hsl.z;
x += $0.x;
if($0.y == 0.) {
    // nop
} else if($0.y < 0.) {
    x = x * (1. + $0.y) - $0.y / 2.;
} else if($0.y == 1.) {
    x = x < 0.5 ? 0. : 1.;
} else {
    x -= 0.5;
    x = x / (1. - $0.y);
    x += 0.5;
}
hsl.z = clamp(x, 0., 1.);
color = hsl2rgb(hsl);
`,
    controls: [
      {name: "Brightness", type: "slider", default: 0.0, min: -1, max: 1, snap: 'any', step: 0.05, precision: 2},
      {name: "Contrast", type: "slider", default: 0.0, min: -1, max: 1, snap: 'any', step: 0.05, precision: 2},
    ],
    vectorize(brightness: number, contrast: number) {
      return [new vec4(brightness, contrast, 0, 0)]
    },
    apply(color: vec3, v: vec4) {
      let hsl = rgb2hsl(color)
      let x = hsl.z

      x += v.x
      if(v.y === 0) {
        // nop
      } else if(v.y < 0) {
        x = x * (1 + v.y) - v.y / 2;
      } else if(v.y === 1) {
        x = x < 0.5  ? 0 : 1;
      } else {
        x -= 0.5;
        x = x / (1 - v.y);
        x += 0.5;
      }
      x = clamp(x, 0, 1);

      hsl.z = x;
      return hsl2rgb(hsl)
    }
  },

  // blend modes
  "blend_normal": {
    id: "blend_normal",
    name: "Blend Normal",
    glsl: "color = $0.rgb * $0.a + color * (1. - $0.a);",
    controls: [
      {name: "Color", type: "color", default: new vec3(1, 0, 0)},
      {name: "Opacity", type: "slider", default: 50, min: 0, max: 100, snap: 1, step: 1, precision: 0},
    ],
    vectorize(color: vec3, opacity: number) {
      return [new vec4(color, opacity / 100)]
    },
    apply(color: vec3, top: vec4) {
      return top.rgb.times(top.a).plus(color.times(1 - top.a));
    }
  },
}
