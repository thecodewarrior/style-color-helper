mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::ImageData;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Component {
    None = 0,
    Hue = 1,
    Saturation = 2,
    Lightness = 3,
}

#[wasm_bindgen()]
pub fn render_spectrum(width: usize, height: usize, hue: f32, saturation: f32, lightness: f32, x_axis: Component, invert_x: bool, y_axis: Component, invert_y: bool) -> Clamped<Vec<u8>> {
    utils::set_panic_hook();
    let mut data: Vec<u8> = Vec::with_capacity(width * height * 4);

    let mut hue = hue;
    let mut saturation = saturation;
    let mut lightness = lightness;

    let posterizer = Posterizer::new(5);

    for yi in 0..height {
        let mut y = yi as f32 / height as f32;
        if invert_y { y = 1. - y; }
        match y_axis {
            Component::None => {}
            Component::Hue => { hue = y }
            Component::Saturation => { saturation = y }
            Component::Lightness => { lightness = y }
        };

        for xi in 0..width {
            let mut x = xi as f32 / width as f32;
            if invert_x { x = 1. - x; }
            match x_axis {
                Component::None => {}
                Component::Hue => { hue = x }
                Component::Saturation => { saturation = x }
                Component::Lightness => { lightness = x }
            };

            let rgb_f = hsl_to_rgb(hue, saturation, lightness);
            let mut rgb = [
                (rgb_f[0] * 255.) as u8,
                (rgb_f[1] * 255.) as u8,
                (rgb_f[2] * 255.) as u8
            ];
            posterizer.apply(&mut rgb);
            data.push(rgb[0]);
            data.push(rgb[1]);
            data.push(rgb[2]);
            data.push(255);
        }
    }

    return Clamped(data);
}

struct Posterizer {
    lookup: Vec<u8>
}

impl Posterizer {
    fn new(levels: usize) -> Posterizer {
        let mut lookup = Vec::with_capacity(256);
        for i in 0..256 {
            lookup.push((255 * (i * levels / 256) / (levels - 1)) as u8);
        }
        return Posterizer {
            lookup
        }
    }

    fn apply(&self, color: &mut [u8; 3]) {
        color[0] = self.lookup[color[0] as usize];
        color[1] = self.lookup[color[1] as usize];
        color[2] = self.lookup[color[2] as usize];
    }
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * (a rust port of https://stackoverflow.com/a/9493060/1541907)
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
fn hsl_to_rgb(h: f32, s: f32, l: f32) -> [f32; 3] {
    if s == 0. {
        [l, l, l]
    } else {
        fn hue2rgb(p: f32, q: f32, t: f32) -> f32 {
            let mut t = t;
            if t < 0. { t += 1.; }
            if t > 1. { t -= 1.; }
            if t < 1. / 6. { return p + (q - p) * 6. * t; }
            if t < 1. / 2. { return q; }
            if t < 2. / 3. { return p + (q - p) * (2. / 3. - t) * 6.; }
            return p;
        }

        let q = if l < 0.5 {
            l * (1. + s)
        } else {
            l + s - l * s
        };

        let p = 2. * l - q;
        [
            hue2rgb(p, q, h + 1. / 3.),
            hue2rgb(p, q, h),
            hue2rgb(p, q, h - 1. / 3.)
        ]
    }
}
