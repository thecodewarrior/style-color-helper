export class ParameterizedFilter {
    constructor(filter) {
        this.filter = filter;
        this.id = filter.id;
        this.parameters = Array.of(...filter.parameters);
        this.values = this.parameters.map(it => it.default);
    }
    apply(color) {
        return this.filter.apply(color, ...this.filter.vectorize(...this.values));
    }
}
//# sourceMappingURL=Filter.js.map