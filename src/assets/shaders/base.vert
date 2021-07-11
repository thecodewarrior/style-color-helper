precision lowp float;

attribute vec4 position;
attribute vec3 hsl;

varying vec3 vHsl;

void main(void) {
    gl_Position = position;
    vHsl = hsl;
}