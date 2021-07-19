import VueStore from "vue-class-store";
import {ParameterizedFilter} from "@/logic/Filter";
import chroma, {Color} from "chroma-js";
import {vec3} from "@/logic/math/vec";
import {clamp} from "@/logic/math/ops";

@VueStore
export default class Model {
  public filters: ParameterizedFilter[] = []
  public hue = 30
  public saturation = 1
  public lightness = 0.75

  addFilter(filter: ParameterizedFilter): ParameterizedFilter {
    this.filters.push(filter)
    return this.filters[this.filters.length - 1]
  }

  get rawColor(): Color {
    return chroma.hsl(this.hue, this.saturation, this.lightness)
  }

  get computedColor(): Color {
    let rgb = this.rawColor.gl()
    let color = new vec3(rgb[0], rgb[1], rgb[2])
    for(let filter of this.filters) {
      color = filter.apply(color)
      color = clamp(color, 0, 1)
    }
    return chroma.gl(color.r, color.g, color.b)
  }
}