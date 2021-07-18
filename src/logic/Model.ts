import VueStore from "vue-class-store";
import {ParameterizedFilter} from "@/logic/Filter";
import chroma, {Color} from "chroma-js";
import {vec3} from "@/logic/math/vec";

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

  get computedColor(): Color {
    let rgb = chroma.hsl(this.hue, this.saturation, this.lightness).rgb()
    let color = new vec3(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)
    for(let filter of this.filters) {
      color = filter.apply(color)
    }
    return chroma.rgb(color.r * 255, color.g * 255, color.b * 255)
  }
}