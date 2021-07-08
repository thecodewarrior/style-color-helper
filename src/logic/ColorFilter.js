import chroma from "chroma-js";
export class PosterizeFilter {
    constructor(levels) {
        this.levels = levels;
    }
    get stepSize() {
        return 256 / this.levels;
    }
    filter(color) {
        const rgb = color.rgb();
        return chroma.rgb(this.filterComponent(rgb[0]), this.filterComponent(rgb[1]), this.filterComponent(rgb[2]));
    }
    filterComponent(value) {
        return 255 * Math.floor(value * this.levels / 256) / (this.levels - 1);
    }
}
//# sourceMappingURL=ColorFilter.js.map