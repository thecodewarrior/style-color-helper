export class ParameterizedFilter {
    constructor(type) {
        this.type = type;
        this.id = type.id;
        this.parameterTypes = Array.of(...type.parameters);
        this.parameters = this.parameterTypes.map(it => it.default);
    }
    apply(color) {
        return this.type.apply(color, ...this.type.vectorize(...this.parameters));
    }
}
//# sourceMappingURL=Filter.js.map