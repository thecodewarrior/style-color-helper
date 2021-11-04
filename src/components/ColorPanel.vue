<template>
  <div class="color-panel">
    <div class="component-row" style="grid-area: hue;" v-tippy:hue>
      <div class="component-label">H</div>
      <color-picker-spectrum
          hue="x" :saturation="model.saturation" :lightness="model.lightness"
          v-model:x="hueAxis"
          :render-width="300" :render-height="1"
          :model="model"
          :hide-filters="hideFilters"
      />
      <div class="component-value">{{hueDisplay}}</div>
    </div>
    <tippy target="hue" placement="right" :extra="{hideOnClick: false}">{{exactHueDisplay}}</tippy>
    <div class="component-row" style="grid-area: saturation;" v-tippy:saturation>
      <div class="component-label">S</div>
      <color-picker-spectrum
          :hue="model.hue" saturation="x" :lightness="model.lightness"
          v-model:x="model.saturation"
          :render-width="300" :render-height="1"
          :model="model"
          :hide-filters="hideFilters"
      />
      <div class="component-value">{{saturationDisplay}}</div>
    </div>
    <tippy target="saturation" placement="right" :extra="{hideOnClick: false}">{{exactSaturationDisplay}}</tippy>
    <div class="component-row" style="grid-area: lightness;" v-tippy:lightness>
      <div class="component-label">L</div>
      <color-picker-spectrum
          :hue="model.hue" :saturation="model.saturation" lightness="x"
          v-model:x="model.lightness"
          :render-width="300" :render-height="1"
          :model="model"
          :hide-filters="hideFilters"
      />
      <div class="component-value">{{lightnessDisplay}}</div>
    </div>
    <tippy target="lightness" placement="right" :extra="{hideOnClick: false}">{{exactLightnessDisplay}}</tippy>
    <div class="main-spectrum" ref="main" :class="mainSpectrumClasses" style="grid-area: main;">
      <color-picker-spectrum
          hue="x" :saturation="model.saturation" lightness="-y"
          v-model:x="hueAxis" v-model:y="inverseLightness"
          :render-width="3000" :render-height="1200"
          :model="model"
          :hide-filters="hideFilters"
      />
    </div>
    <div class="swatch" :style="[rawSwatchStyle, 'grid-area: original;']" v-tippy:original @click="copyOriginal">{{ model.rawColor.hex() }}</div>
    <tippy target="original" trigger="manual" :visible="originalCopyVisible">Copied</tippy>
    <div class="swatch" :style="[filteredSwatchStyle, 'grid-area: filtered;']" v-tippy:filtered @click="copyFiltered">{{ model.computedColor.hex() }}</div>
    <tippy target="filtered" trigger="manual" :visible="filteredCopyVisible">Copied</tippy>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import chroma, {Color} from "chroma-js";
import {PropType} from "vue";
import Tippy from "@/lib/Tippy.vue";

@Options({
  components: {
    Tippy,
    ColorPickerSpectrum
  },
  props: {
    model: {type: Object as PropType<Model>, required: true},
    hideFilters: {type: Boolean, default: false},
  }
})
export default class ColorPanel extends Vue {
  model!: Model
  originalCopyVisible: boolean = false
  originalCopyTimeout: number = -1
  filteredCopyVisible: boolean = false
  filteredCopyTimeout: number = -1

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

  get hueDisplay(): number {
    return Math.round(this.model.hue)
  }

  get exactHueDisplay(): string {
    return (Math.round(this.model.hue * 100) / 100).toFixed(2)
  }

  get saturationDisplay(): number {
    return Math.round(this.model.saturation * 100)
  }

  get exactSaturationDisplay(): string {
    return (Math.round(this.model.saturation * 100 * 100) / 100).toFixed(2)
  }

  get lightnessDisplay(): number {
    return Math.round(this.model.lightness * 100)
  }

  get exactLightnessDisplay(): string {
    return (Math.round(this.model.lightness * 100 * 100) / 100).toFixed(2)
  }

  get rawSwatchStyle() {
    return ColorPanel.swatchStyle(this.model.rawColor)
  }

  get filteredSwatchStyle() {
    return ColorPanel.swatchStyle(this.model.computedColor)
  }

  lastMainSize: {width: number, height: number} = {width: 0, height: 0}

  mainSize(): {width: number, height: number} {
    let main = this.$refs.main
    if(main) {
      let {width, height} = (main as HTMLElement).getBoundingClientRect();
      if(width !== 0 && height !== 0) {
        this.lastMainSize = {width, height}
      }
    }
    return this.lastMainSize
  }

  get mainSpectrumClasses() {
    // get these ahead of time to wire up reactivity even when main == undefined
    let hue = this.model.hue
    let lightness = this.model.lightness

    let {width, height} = this.mainSize()
    if(width === 0 || height === 0) return {}

    let x = hue / 360 * width
    let y = (1 - lightness) * height

    let pad = 25;
    let left = x < pad;
    let right = width - x < pad;
    let top = y < pad;
    let bottom = height - y < pad;

    return {
      'collapse-top-left': top && left,
      'collapse-bottom-left': bottom && left,
      'collapse-top-right': top && right,
      'collapse-bottom-right': bottom && right,
    }
  }

  copyOriginal() {
    navigator.clipboard.writeText(this.model.rawColor.hex().substring(1).toUpperCase()).then(() => {
      this.originalCopyVisible = true
      clearTimeout(this.originalCopyTimeout)
      this.originalCopyTimeout = setTimeout(() => {
        this.originalCopyVisible = false 
      }, 750)
    })
  }

  copyFiltered() {
    navigator.clipboard.writeText(this.model.computedColor.hex().substring(1).toUpperCase()).then(() => {
      this.filteredCopyVisible = true
      clearTimeout(this.filteredCopyTimeout)
      this.filteredCopyTimeout = setTimeout(() => {
        this.filteredCopyVisible = false
      }, 750)
    })
  }

  private static swatchStyle(color: Color) {
    let whiteContrast = chroma.contrast('white', color)
    let blackContrast = chroma.contrast('black', color)
    return {
      'color': blackContrast > whiteContrast ? 'black' : 'white',
      'background-color': color.hex()
    }
  }
}
</script>

<style scoped>
.color-panel {
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
      "hue hue"
      "saturation saturation"
      "lightness lightness"
      "main main"
      "original filtered";
  column-gap: 15px;
}

.component-row {
  display: grid;
  grid-template-columns: auto 1fr 35px;
  padding-left: 4px;
  padding-right: 3px;
  margin-bottom: 5px;

  background: var(--alt-background);
  border: var(--standard-border);
  border-radius: 100px;
}

.component-label {
  border-right: var(--standard-border);
  text-align: right;
  padding-right: 3px;
}

.component-value {
  border-left: var(--standard-border);
  text-align: center;
}

.main-spectrum {
  margin-bottom: 10px;
}

.main-spectrum .color-picker-spectrum {
  height: 100%;
}

.main-spectrum {
  border: var(--standard-border);
  border-radius: 20px;
  transition: border-radius 0.5s;
}

.main-spectrum >>> .spectrum {
  border-radius: 15px;
  transition: border-radius 0.5s;
  overflow: hidden;
}

.main-spectrum.collapse-top-left >>> .spectrum {
  border-top-left-radius: 0;
}
.main-spectrum.collapse-bottom-left >>> .spectrum {
  border-bottom-left-radius: 0;
}
.main-spectrum.collapse-top-right >>> .spectrum {
  border-top-right-radius: 0;
}
.main-spectrum.collapse-bottom-right >>> .spectrum {
  border-bottom-right-radius: 0;
}
.main-spectrum.collapse-top-left {
  border-top-left-radius: 1px;
}
.main-spectrum.collapse-bottom-left {
  border-bottom-left-radius: 1px;
}
.main-spectrum.collapse-top-right {
  border-top-right-radius: 1px;
}
.main-spectrum.collapse-bottom-right {
  border-bottom-right-radius: 1px;
}

.swatch {
  padding: 15px 0;
  flex-grow: 1;

  text-align: center;
  font-family: 'Roboto Mono', sans-serif;
  font-weight: 600;
  font-size: 20px;
  text-transform: uppercase;

  border: var(--standard-border);
  border-radius: 20px;
}

</style>