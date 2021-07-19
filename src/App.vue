<template>
  <div class="app">
    <div class="color-panel">
      <div class="component-row">
        <color-picker-spectrum
            style="width: 300px; height: 20px; margin-bottom: 10px"
            hue="x" :saturation="model.saturation" :lightness="model.lightness"
            v-model:x="hueAxis"
            :render-width="300" :render-height="1"
            :model="model"
            :hide-filters="hideFilters"
        />
      </div>
      <div class="component-row">
        <color-picker-spectrum
            style="width: 300px; height: 20px; margin-bottom: 10px"
            :hue="model.hue" saturation="x" :lightness="model.lightness"
            v-model:x="model.saturation"
            :render-width="300" :render-height="1"
            :model="model"
            :hide-filters="hideFilters"
        />
      </div>
      <div class="component-row">
        <color-picker-spectrum
            style="width: 300px; height: 20px; margin-bottom: 10px"
            :hue="model.hue" :saturation="model.saturation" lightness="x"
            v-model:x="model.lightness"
            :render-width="300" :render-height="1"
            :model="model"
            :hide-filters="hideFilters"
        />
      </div>
      <div class="main-spectrum" :class="mainSpectrumClasses">
        <color-picker-spectrum
            style="width: 300px; height: 120px;"
            hue="x" :saturation="model.saturation" lightness="-y"
            v-model:x="hueAxis" v-model:y="inverseLightness"
            :render-width="300" :render-height="120"
            :model="model"
            :hide-filters="hideFilters"
        />
      </div>
      <div class="swatch-row">
        <div class="swatch" :style="rawSwatchStyle">{{ model.rawColor.hex() }}</div>
        <div class="swatch" :style="filteredSwatchStyle">{{ model.computedColor.hex() }}
        </div>
      </div>
    </div>
    <div class="panel-separator"></div>
    <div class="filter-panel">
      <mdicon style="color: var(--main-highlight);" :name="hideFilters ? 'eye-off' : 'eye'" @click="hideFilters = !hideFilters"/>
      <filter-editor v-for="(filter, i) in model.filters" :key="i" :filter="filter"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import ColorPicker from "@/components/ColorPicker.vue";
import {ParameterizedFilter} from "@/logic/Filter";
import {filterRegistry} from "@/logic/Filters";
import FilterEditor from "@/components/FilterEditor.vue";
import Model from "@/logic/Model";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import chroma, {Color} from "chroma-js";
import {vec4} from "@/logic/math/vec";

@Options({
  components: {ColorPickerSpectrum, FilterEditor, ColorPicker},
  props: {}
})
export default class App extends Vue {
  model: Model = new Model()
  hideFilters: boolean = false

  get hueAxis(): number {
    return this.model.hue / 360
  }

  set hueAxis(value: number) {
    this.model.hue = value * 360
  }

  get inverseLightness(): number {
    return 1 - this.model.lightness
  }

  set inverseLightness(value: number) {
    this.model.lightness = 1 - value
  }

  private swatchStyle(color: Color) {
    let whiteContrast = chroma.contrast('white', color)
    let blackContrast = chroma.contrast('black', color)
    return {
      'color': blackContrast > whiteContrast ? 'black' : 'white',
      'background-color': color.hex()
    }
  }

  get rawSwatchStyle() {
    return this.swatchStyle(this.model.rawColor)
  }

  get filteredSwatchStyle() {
    return this.swatchStyle(this.model.computedColor)
  }

  get mainSpectrumClasses() {
    let x = this.model.hue / 360 * 300
    let y = (1 - this.model.lightness) * 120

    let pad = 25;
    let left = x < pad;
    let right = 300 - x < pad;
    let top = y < pad;
    let bottom = 120 - y < pad;

    return {
      'collapse-top-left': top && left,
      'collapse-bottom-left': bottom && left,
      'collapse-top-right': top && right,
      'collapse-bottom-right': bottom && right,
    }
  }

  mounted() {
    this.model.addFilter(new ParameterizedFilter(filterRegistry["posterize"])).values[0] = 3
    this.model.addFilter(new ParameterizedFilter(filterRegistry["blend_normal"])).values[0] = new vec4(1, 0, 1, 0.2)
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&display=swap');

body {
  background-color: #001119;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;

  --main-highlight: #0fb1ad;
  --main-background: #1a283d;
  --main-border: #1a1c31;
}
</style>

<style scoped>
.app {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 30px minmax(0, 1fr);
  padding: 20px;

  background: var(--main-background);
  border: 5px solid var(--main-highlight);
  border-radius: 20px;
}

.color-panel {
  display: flex;
  flex-direction: column;
}

.main-spectrum {
  padding: 5px;
}

.main-spectrum >>> canvas {
  outline: 5px solid var(--main-border);
  border-radius: 15px;
  transition: border-radius 0.5s;
}

.main-spectrum.collapse-top-left >>> canvas {
  border-top-left-radius: 1px;
}
.main-spectrum.collapse-bottom-left >>> canvas {
  border-bottom-left-radius: 1px;
}
.main-spectrum.collapse-top-right >>> canvas {
  border-top-right-radius: 1px;
}
.main-spectrum.collapse-bottom-right >>> canvas {
  border-bottom-right-radius: 1px;
}

.swatch-row {
  display: flex;
  margin-top: 20px;
}

.swatch {
  padding: 20px 0;
  flex-grow: 1;

  text-align: center;
  font-family: 'Roboto Mono', sans-serif;
  font-size: 20px;
  text-transform: uppercase;

  border: 5px solid var(--main-border);
  border-radius: 20px;
}

.swatch:first-of-type {
  margin-right: 20px;
}

.filter-panel {
}

.panel-separator {
  width: 5px;

  background-color: var(--main-highlight);
  border-radius: 3px;

  margin: -10px 0;
  justify-self: center;
}
</style>
