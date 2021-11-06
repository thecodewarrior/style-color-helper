import VueStore from "vue-class-store";
import {ControlValue, FilterControl, ParameterizedFilter} from "@/logic/Filter";
import chroma, {Color} from "chroma-js";
import {vec3, vec4} from "@/logic/math/vec";
import {clamp} from "@/logic/math/ops";
import {roundDecimals} from "@/utils";
import {filterRegistry} from "@/logic/Filters";

@VueStore
export default class Model {
  public name: string = "Unnamed"
  public filters: ParameterizedFilter[] = []
  public hue = 30
  public saturation = 1
  public lightness = 0.75

  get normalHue(): number {
    return this.hue / 360
  }
  set normalHue(value: number) {
    this.hue = value * 360
  }

  addFilter(filter: ParameterizedFilter): ParameterizedFilter {
    this.filters.push(filter)
    return this.filters[this.filters.length - 1]
  }

  set rawColor(value) {
    let hsl = value.hsl();
    this.hue = hsl[0];
    this.saturation = hsl[1];
    this.lightness = hsl[2];
  }

  get rawColor(): Color {
    return chroma.hsl(this.hue, this.saturation, this.lightness)
  }

  get computedColor(): Color {
    let rgb = this.rawColor.gl()
    let color = new vec3(rgb[0], rgb[1], rgb[2])
    for(let filter of this.filters) {
      if(!filter.visible)
        continue
      color = filter.apply(color)
      color = clamp(color, 0, 1)
    }
    return chroma.gl(color.r, color.g, color.b)
  }

  saveFilters(): object {
    let filters = this.filters.map((filter) => {
      let args: Record<string, any> = {}
      for(let i = 0; i < filter.parameters.length; i++) {
        let parameter = filter.parameters[i]
        let value = filter.values[i]
        switch(parameter.type) {
          case "color": {
            let v = value as vec4
            let color = chroma.gl(v.r, v.g, v.b, v.a)
            args[parameter.id] = color.hex("rgb")
            break;
          }
          case "number": {
            let v = value as number
            args[parameter.id] = roundDecimals(v, parameter.precision)
            break;
          }
          case "slider": {
            let v = value as number
            args[parameter.id] = roundDecimals(v, parameter.precision)
            break;
          }
        }
      }
      return {
        id: filter.filter.id,
        args
      }
    })

    return {
      name: this.name,
      filters
    }
  }

  loadFilters(json: Record<string, any>): boolean {
    if(typeof json.name !== 'string' || !Array.isArray(json.filters)) {
      return false
    }
    let filters: ParameterizedFilter[] = []
    for(let data of json.filters as Record<string, any>[]) {
      if(typeof data.id !== 'string' || !data.args) return false

      let filter = filterRegistry[data.id]
      if(!filter) return false

      let values: ControlValue[] = []
      for(let param of filter.controls) {
        let value = data.args[param.id]
        if(value === undefined) return false

        switch(param.type) {
          case "color": {
            if (!chroma.valid(value)) return false
            let color = chroma(value)
            values.push(new vec4(...color.gl()))
            break;
          }
          case "number": {
            if(typeof value !== "number") return false
            values.push(value)
            break;
          }
          case "slider": {
            if(typeof value !== "number") return false
            values.push(value)
            break;
          }
        }
      }
      let paramFilter = new ParameterizedFilter(filter)
      paramFilter.values.splice(0, paramFilter.values.length, ...values)
      filters.push(paramFilter)
    }
    this.name = json.name
    this.filters = filters
    return true
  }
}