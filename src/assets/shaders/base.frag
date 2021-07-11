precision lowp float;

varying vec3 vHsl;

// https://stackoverflow.com/a/42261473/1541907
vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0, 4.0, 2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

#pragma head

void main() {
    vec3 color = hsl2rgb(vHsl);

    #pragma body

    gl_FragColor = vec4(color, 1.0);
}
