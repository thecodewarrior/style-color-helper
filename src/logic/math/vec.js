// this code is only used for the final value calculation, so similarity to the GLSL is prioritized over speed
export function map(v, fn) {
    if (v instanceof vec4) {
        return new vec4(fn(v.r), fn(v.g), fn(v.b), fn(v.a));
    }
    else if (v instanceof vec3) {
        return new vec3(fn(v.r), fn(v.g), fn(v.b));
    }
    else {
        return fn(v);
    }
}
export function zip(a, b, fn) {
    if (a instanceof vec4 && b instanceof vec4) {
        return new vec4(fn(a.r, b.r), fn(a.g, b.g), fn(a.b, b.b), fn(a.a, b.a));
    }
    else if (a instanceof vec3 && b instanceof vec3) {
        return new vec3(fn(a.r, b.r), fn(a.g, b.g), fn(a.b, b.b));
    }
    else {
        return fn(a, b);
    }
}
export function floor(v) {
    return map(v, Math.floor);
}
export class vec4 {
    constructor(x, y, z, w) {
        if (x instanceof vec4) {
            this.r = x.r;
            this.g = x.g;
            this.b = x.b;
            this.a = x.a;
        }
        else if (x instanceof vec3) {
            this.r = x.r;
            this.g = x.g;
            this.b = x.b;
            this.a = y;
        }
        else if (y === undefined) {
            this.r = x;
            this.g = x;
            this.b = x;
            this.a = x;
        }
        else {
            this.r = x;
            this.g = y;
            this.b = z;
            this.a = w;
        }
    }
    get rgb() {
        return new vec3(this.r, this.g, this.b);
    }
    set rgb(value) {
        this.r = value.r;
        this.g = value.g;
        this.b = value.b;
    }
    get rgba() {
        return new vec4(this);
    }
    set rgba(value) {
        this.r = value.r;
        this.g = value.g;
        this.b = value.b;
        this.a = value.a;
    }
    get x() {
        return this.r;
    }
    get y() {
        return this.g;
    }
    get z() {
        return this.b;
    }
    get w() {
        return this.a;
    }
    plus(other) {
        if (other instanceof vec4)
            return zip(this, other, (a, b) => a + b);
        else
            return zip(this, new vec4(other, 0), (a, b) => a + b);
    }
    minus(other) {
        if (other instanceof vec4)
            return zip(this, other, (a, b) => a - b);
        else
            return zip(this, new vec4(other, 0), (a, b) => a - b);
    }
    times(other) {
        if (other instanceof vec4)
            return zip(this, other, (a, b) => a * b);
        else if (other instanceof vec3)
            return zip(this, new vec4(other, 1), (a, b) => a * b);
        else
            return map(this, (v) => v * other);
    }
    div(other) {
        if (other instanceof vec4)
            return zip(this, other, (a, b) => a / b);
        else if (other instanceof vec3)
            return zip(this, new vec4(other, 1), (a, b) => a / b);
        else
            return map(this, (v) => v / other);
    }
}
export class vec3 {
    constructor(x, y, z) {
        if (x instanceof vec3) {
            this.r = x.r;
            this.g = x.g;
            this.b = x.b;
        }
        else if (y === undefined) {
            this.r = x;
            this.g = x;
            this.b = x;
        }
        else {
            this.r = x;
            this.g = y;
            this.b = z;
        }
    }
    get rgb() {
        return new vec3(this);
    }
    set rgb(value) {
        this.r = value.r;
        this.g = value.g;
        this.b = value.b;
    }
    get x() {
        return this.r;
    }
    get y() {
        return this.g;
    }
    get z() {
        return this.b;
    }
    plus(other) {
        return zip(this, other, (a, b) => a + b);
    }
    minus(other) {
        return zip(this, other, (a, b) => a - b);
    }
    times(other) {
        if (other instanceof vec3)
            return zip(this, other, (a, b) => a * b);
        else
            return map(this, (v) => v * other);
    }
    div(other) {
        if (other instanceof vec3)
            return zip(this, other, (a, b) => a / b);
        else
            return map(this, (v) => v / other);
    }
}
//# sourceMappingURL=vec.js.map