import VueStore from "vue-class-store";
import {ControlValue, ParameterizedFilter} from "@/logic/Filter";
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
  public hideFilters: boolean = false

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

  get filteredColor(): Color {
    return this.hideFilters ? this.rawColor : this.computedColor
  }

  get encoded(): string {
    let text = ''
    for(let filter of this.filters) {
      text += filter.filter.id
      text += ':'
      for(let i = 0; i < filter.parameters.length; i++) {
        if(i != 0) {
          text += ','
        }
        let parameter = filter.parameters[i]
        let value = filter.values[i]
        switch(parameter.type) {
          case "color": {
            let v = value as vec4
            let color = chroma.gl(v.r, v.g, v.b, v.a)
            text += color.hex("rgb").substring(1)
            break;
          }
          case "number": {
            let v = value as number
            text += roundDecimals(v, parameter.precision)
            break;
          }
          case "slider": {
            let v = value as number
            text += roundDecimals(v, parameter.precision)
            break;
          }
          // future syntax for vectors, if I need them, will be slash-separated `0.4/4.8/7`
        }
      }
      text += ';'
    }
    text += '~'
    text += this.name
    return text
  }

  decode(text: string): boolean {
    if(text.startsWith('{')) {
      return this.loadFilters(JSON.parse(text))
    }
    if(text.startsWith('~')) {
      this.filters.splice(0, this.filters.length)
      this.name = text.substring(1)
      return true
    }

    let [filtersText, name] = text.split(';~', 2)
    if(name === undefined) {
      return false
    }

    let filters: ParameterizedFilter[] = []
    let filterEntries = filtersText.split(';')
    let filterRegex = /^([a-z_]+):(.*)$/
    for(let filterEntry of filterEntries) {
      let match = filterRegex.exec(filterEntry)
      if(!match) {
        return false
      }
      let [, id, parameterText] = match

      let filter = filterRegistry[id]
      if(!filter) {
        return false
      }

      let parameters = parameterText.split(',')
      if(parameters.length !== filter.controls.length) {
        return false
      }

      let values: ControlValue[] = []
      for(let i = 0; i < filter.controls.length; i++) {
        let control = filter.controls[i]
        let value = parameters[i]

        switch(control.type) {
          case "color": {
            if (!chroma.valid(value)) return false
            let color = chroma(value)
            values.push(new vec4(...color.gl()))
            break;
          }
          case "number": {
            let number = parseFloat(value)
            if(isNaN(number)) {
              return false
            }
            values.push(number)
            break;
          }
          case "slider": {
            let number = parseFloat(value)
            if(isNaN(number)) {
              return false
            }
            values.push(number)
            break;
          }
        }
      }
      let paramFilter = new ParameterizedFilter(filter)
      paramFilter.values.splice(0, paramFilter.values.length, ...values)
      filters.push(paramFilter)
    }
    this.name = name
    this.filters = filters
    return true
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