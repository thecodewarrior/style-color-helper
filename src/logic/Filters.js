import { floor, vec4 } from "@/logic/math/vec";
export const filterTypes = [
    {
        id: "posterize",
        name: "Posterize",
        glsl: "color = floor(color * $0.x) / $0.y;",
        parameters: [
            { type: "float", min: 2, default: 5 }
        ],
        vectorize(factor) {
            return [new vec4(factor, factor - 1, 0, 0)];
        },
        apply(color, factor) {
            return floor(color.times(factor.x)).div(factor.y);
        }
    },
    {
        id: "blend_normal",
        name: "Blend Normal",
        glsl: "color = $0.rgb * $0.a + color * (1. - $0.a);",
        parameters: [
            { type: "rgba", default: new vec4(1, 0, 0, 1) }
        ],
        vectorize(color) {
            return [color];
        },
        apply(color, top) {
            return top.rgb.times(top.a).plus(color.times(1 - top.a));
        }
    }
];
let registry = {};
for (let type of filterTypes) {
    registry[type.id] = type;
}
export const filterRegistry = registry;
//# sourceMappingURL=Filters.js.map