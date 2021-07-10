import chroma from "chroma-js";
export class CompoundFilter {
    constructor(filters = []) {
        this.filters = filters;
    }
    apply(color) {
        let filtered = color;
        for (let filter of this.filters) {
            filtered = filter.apply(filtered);
        }
        return filtered;
    }
}
export class PosterizeFilter {
    constructor(levels) {
        this.levels = levels;
    }
    apply(color) {
        const rgb = color.rgb();
        return chroma.rgb(this.filterComponent(rgb[0]), this.filterComponent(rgb[1]), this.filterComponent(rgb[2]));
    }
    filterComponent(value) {
        return 255 * Math.floor(value * this.levels / 256) / (this.levels - 1);
    }
}
//# sourceMappingURL=ColorFilter.js.map