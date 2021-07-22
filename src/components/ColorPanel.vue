<template>
  <div class="color-panel">
    <div class="component-row" style="grid-area: hue;">
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
    <div class="component-row" style="grid-area: saturation;">
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
    <div class="component-row" style="grid-area: lightness;">
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
    <div class="main-spectrum" ref="main" :class="mainSpectrumClasses" style="grid-area: main;">
      <color-picker-spectrum
          hue="x" :saturation="model.saturation" lightness="-y"
          v-model:x="hueAxis" v-model:y="inverseLightness"
          :render-width="300" :render-height="120"
          :model="model"
          :hide-filters="hideFilters"
      />
    </div>
    <div class="swatch" :style="[rawSwatchStyle, 'grid-area: original;']">{{ model.rawColor.hex() }}</div>
    <div class="swatch" :style="[filteredSwatchStyle, 'grid-area: filtered;']">{{ model.computedColor.hex() }}</div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import chroma, {Color} from "chroma-js";
import {PropType} from "vue";

@Options({
  components: {
    ColorPickerSpectrum
  },
  props: {
    model: {type: Object as PropType<Model>, required: true},
    hideFilters: {type: Boolean, default: false},
  }
})
export default class ColorPanel extends Vue {
  model!: Model

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

  get saturationDisplay(): number {
    return Math.round(this.model.saturation * 100)
  }

  get lightnessDisplay(): number {
    return Math.round(this.model.lightness * 100)
  }

  get rawSwatchStyle() {
    return ColorPanel.swatchStyle(this.model.rawColor)
  }

  get filteredSwatchStyle() {
    return ColorPanel.swatchStyle(this.model.computedColor)
  }

  get mainSpectrumClasses() {
    // get these ahead of time to wire up reactivity even when main == undefined
    let hue = this.model.hue
    let lightness = this.model.lightness

    let main = this.$refs.main
    if(main == undefined) return {}

    let {width, height} = (main as HTMLElement).getBoundingClientRect();
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

.main-spectrum >>> .spectrum {
  border: var(--standard-border);
  border-radius: 20px;
  transition: border-radius 0.5s;
  overflow: hidden;
}

.main-spectrum.collapse-top-left >>> .spectrum {
  border-top-left-radius: 1px;
}
.main-spectrum.collapse-bottom-left >>> .spectrum {
  border-bottom-left-radius: 1px;
}
.main-spectrum.collapse-top-right >>> .spectrum {
  border-top-right-radius: 1px;
}
.main-spectrum.collapse-bottom-right >>> .spectrum {
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