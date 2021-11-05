import {vec3, vec4} from "@/logic/math/vec";
import {Filter} from "@/logic/Filter";
import {clamp, floor, max, min, mix, zip} from "@/logic/math/ops";
import {hsl2rgb, rgb2hsl} from "@/logic/math/hsl";

// todo:
//  # dani
//  + posterize
//  + brightness/contrast
//  + normal
//  + multiply
//  + additive
//  + color burn
//  + color dodge
//  - reflect
//  - glow
//  + overlay
//  + difference
//  + negation
//  + lighten
//  + darken
//  + screen
//  + xor
//  # css
//  -
//  -
//  # me
//  + subtract
//  + adjust HSL (±H, ±S, ±L)
//  + multiply HSL (H, S, L)
//  - set hue
//  - set saturation
//  - set lightness

export const filterMenu: string[] = [
  "posterize",
  "brightness_contrast",
  "hsl_adjust",
  "hsl_multiply",

  "blend_normal",
  "blend_multiply",
  "blend_additive",
  "blend_subtract",
  "blend_difference",
  "blend_screen",
  "blend_overlay",

  "color_dodge",
  "color_burn",
  "darken",
  "lighten",

  "xor",
  "negation",
]

export const filterRegistry: Record<string, Filter> = {
  // artistic filters
  "posterize": {
    id: "posterize",
    name: "Posterize",
    glsl: "color = floor(color * $0.x) / $0.y;",
    controls: [
      {name: "Levels", type: "number", default: 5, min: 2, max: 255, step: 1, precision: 0}
    ],
    vectorize(factor: number) {
      return [new vec4(factor + 0.0001, factor + 0.0001 - 1, 0, 0)]
    },
    apply(color: vec3, $0: vec4) {
      return floor(color.times($0.x)).div($0.y);
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
    apply(color: vec3, $0: vec4) {
      let hsl = rgb2hsl(color)
      let x = hsl.z

      x += $0.x
      if($0.y === 0) {
        // nop
      } else if($0.y < 0) {
        x = x * (1 + $0.y) - $0.y / 2;
      } else if($0.y === 1) {
        x = x < 0.5  ? 0 : 1;
      } else {
        x -= 0.5;
        x = x / (1 - $0.y);
        x += 0.5;
      }
      x = clamp(x, 0, 1);

      hsl.z = x;
      return hsl2rgb(hsl)
    }
  },

  "hsl_adjust": {
    id: "hsl_adjust",
    name: "Adjust HSL",
    glsl: `
vec3 hsl = rgb2hsl(color);
hsl += $0.xyz;
hsl.x = hsl.x - floor(hsl.x);
hsl = clamp(hsl, 0., 1.);
color = hsl2rgb(hsl);
`,
    controls: [
      {name: "Hue", type: "slider", default: 0.0, min: -180, max: 180, snap: 'any', step: 1, precision: 2},
      {name: "Saturation", type: "slider", default: 0.0, min: -1, max: 1, snap: 'any', step: 0.05, precision: 2},
      {name: "Lightness", type: "slider", default: 0.0, min: -1, max: 1, snap: 'any', step: 0.05, precision: 2},
    ],
    vectorize(hue: number, saturation: number, lightness: number) {
      return [new vec4(hue / 360, saturation, lightness, 0)]
    },
    apply(color: vec3, $0: vec4) {
      let hsl = rgb2hsl(color)
      hsl = hsl.plus($0.xyz)
      hsl.x = hsl.x - floor(hsl.x)
      hsl = clamp(hsl, 0., 1.)
      return hsl2rgb(hsl)
    }
  },

  "hsl_multiply": {
    id: "hsl_multiply",
    name: "Multiply HSL",
    glsl: `
vec3 hsl = rgb2hsl(color);
hsl *= $0.xyz;
hsl.x = hsl.x - floor(hsl.x);
hsl = clamp(hsl, 0., 1.);
color = hsl2rgb(hsl);
`,
    controls: [
      {name: "Hue", type: "number", default: 1.0, min: -360, max: 360, step: 0.05, precision: 2},
      {name: "Saturation", type: "slider", default: 1.0, min: 0, max: 3, snap: 'any', step: 0.05, precision: 2, textMax: null},
      {name: "Lightness", type: "slider", default: 1.0, min: 0, max: 3, snap: 'any', step: 0.05, precision: 2, textMax: null},
    ],
    vectorize(hue: number, saturation: number, lightness: number) {
      return [new vec4(hue, saturation, lightness, 0)]
    },
    apply(color: vec3, $0: vec4) {
      let hsl = rgb2hsl(color)
      hsl = hsl.times($0.xyz)
      hsl.x = hsl.x - floor(hsl.x)
      hsl = clamp(hsl, 0., 1.)
      return hsl2rgb(hsl)
    }
  },

  // blend modes
  "blend_normal": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Normal_blend_mode
    id: "blend_normal",
    name: "Blend Normal",
    defaultColor: new vec3(1, 0, 0),
    defaultAlpha: 50,
    glsl: "o = b",
    blend(a: number, b: number) {
      return b
    }
  }),

  "blend_multiply": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Multiply
    id: "blend_multiply",
    name: "Multiply",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: "o = a * b",
    blend(a: number, b: number) {
      return a * b
    }
  }),

  "blend_additive": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Addition
    id: "blend_additive",
    name: "Additive",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: "o = a + b",
    blend(a: number, b: number) {
      return a + b
    }
  }),

  "blend_subtract": blend({
    id: "blend_subtract",
    name: "Subtract",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: "o = a - b",
    blend(a: number, b: number) {
      return a - b
    }
  }),

  "blend_screen": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Screen
    id: "blend_screen",
    name: "Screen",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: "o = 1. - (1. - a) * (1. - b)",
    blend(a: number, b: number) {
      return 1. - (1. - a) * (1. - b)
    }
  }),

  "blend_overlay": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Overlay
    id: "blend_overlay",
    name: "Overlay",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: "o = a < 0.5 ? 2. * a * b : 1. - 2. * (1. - a) * (1. - b)",
    blend(a: number, b: number) {
      return a < 0.5 ? 2. * a * b : 1. - 2. * (1. - a) * (1. - b)
    }
  }),

  "blend_difference": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Difference
    id: "blend_difference",
    name: "Difference",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: "o = a > b ? a - b : b - a",
    blend(a: number, b: number) {
      return a > b ? a - b : b - a
    }
  }),

  "color_dodge": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Dodge_and_burn
    id: "color_dodge",
    name: "Color Dodge",
    defaultColor: new vec3(0.75, 0.5, 0.75),
    defaultAlpha: 100,
    glsl: "o = b == 1. ? 1. : a / (1. - b)",
    blend(a: number, b: number) {
      return b == 1. ? 1. : a / (1. - b)
    }
  }),

  "color_burn": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Dodge_and_burn
    id: "color_burn",
    name: "Color Burn",
    defaultColor: new vec3(0.75, 0.5, 0.75),
    defaultAlpha: 100,
    glsl: "o = a == 1. ? 1. : b == 0. ? 0. : 1. - (1. - a) / b",
    blend(a: number, b: number) {
      return a == 1. ? 1. : b == 0. ? 0. : 1. - (1. - a) / b
    }
  }),

  "darken": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Darken_Only
    id: "darken",
    name: "Darken",
    defaultColor: new vec3(0.75, 0.5, 0.75),
    defaultAlpha: 100,
    glsl: "o = min(a, b)",
    blend(a: number, b: number) {
      return min(a, b)
    }
  }),

  "lighten": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Lighten_Only
    id: "lighten",
    name: "Lighten",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: "o = max(a, b)",
    blend(a: number, b: number) {
      return max(a, b)
    }
  }),

  "xor": blend({ // https://en.wikipedia.org/wiki/Blend_modes#Boolean_arithmetic_blend_modes
    id: "xor",
    name: "XOR",
    defaultColor: new vec3(0.5, 0.25, 0.5),
    defaultAlpha: 100,
    glsl: `
    int ai = int(a * 255);
    int bi = int(b * 255);
    int oi = ai ^ bi;
    o = float(oi) / 255.;
    `,
    blend(a: number, b: number) {
      let ai = floor(a * 255)
      let bi = floor(b * 255)
      let oi = ai ^ bi;
      return oi / 255.
    }
  }),

  "negation": {
    id: "negation",
    name: "Negation",
    glsl: "color = mix(color, vec3(1) - color, $0.x);",
    controls: [
      {name: "Blend", type: "slider", default: 100, min: 0, max: 100, snap: 1, step: 1, precision: 0, suffix: '%'},
    ],
    vectorize(blend: number) {
      return [new vec4(blend, 0, 0, 0)]
    },
    apply(color: vec3, $0: vec4) {
      return mix(color, new vec3(1).minus(color), $0.x)
    }
  },
}

{
  let keys = new Set(Object.keys(filterRegistry))
  for(let menu of filterMenu) {
    keys.delete(menu)
  }
  for(let missing of keys) {
    console.warn("Registered filter " + missing + " isn't present in the menu")
  }
}

function blend_glsl(operation: string): string {
  return `
    vec3 blend = vec3(0);
    {
      float a = color.r, b = $0.r, o;
      ${operation};
      blend.r = o;
    }
    {
      float a = color.g, b = $0.g, o;
      ${operation};
      blend.g = o;
    }
    {
      float a = color.b, b = $0.b, o;
      ${operation};
      blend.b = o;
    }
    color = mix(color, blend, $0.a);
  `
}

function blend_js(operation: (a: number, b: number) => number): (color: vec3, $0: vec4) => vec3 {
  return function(color, $0) {
    return mix(color, zip(color, $0.rgb, operation), $0.a)
  }
}

type BlendOptions = {
  id: string,
  name: string,
  defaultColor: vec3,
  defaultAlpha: number,
  /**
   * Base color is `a`, color being blended on top is `b`, output goes in `o`. trailing semicolon optional
   */
  glsl: string,
  blend(a: number, b: number): number,
}

function blend(options: BlendOptions): Filter {
  return {
    id: options.id,
    name: options.name,
    glsl: blend_glsl(options.glsl),
    controls: [
      {name: "Color", type: "color", default: options.defaultColor},
      {name: "Opacity", type: "slider", default: options.defaultAlpha, min: 0, max: 100, snap: 1, step: 1, precision: 0, suffix: '%'},
    ],
    vectorize(color: vec3, opacity: number) {
      return [new vec4(color, opacity / 100)]
    },
    apply: blend_js(options.blend)
  }
}
