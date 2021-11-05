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
    <color-picker-spectrum
        class="main-spectrum"
        hue="x" :saturation="model.saturation" lightness="-y"
        v-model:x="hueAxis" v-model:y="inverseLightness"
        :render-width="300" :render-height="100"
        :model="model"
        :hide-filters="hideFilters"
        :border="{radius: 20, width: 5, transition: '0.5s'}"
        style="grid-area: main;"
    />
    <div class="swatch raw-swatch" :style="rawSwatchStyle" v-tippy:original>
      #<div class="hex-editor" ref="hexEditor" contenteditable="true" spellcheck="false" @input="hexEditorChanged" @focus="hexEditorFocus" @blur="hexEditorBlur" @keydown="hexEditorKeydown"></div>
    </div>
    <div class="swatch filtered-swatch" :style="filteredSwatchStyle" v-tippy:filtered @click="copyFiltered">{{ filteredColor.hex() }}</div>
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
import {formatDecimal} from "@/utils";
import {Watch} from "vue-property-decorator";

@Options({
  components: {
    Tippy,
    ColorPickerSpectrum
  },
  props: {
    model: {type: Object as PropType<Model>, required: true},
    hideFilters: {type: Boolean, default: false},
    hideMainSpectrum: {type: Boolean, default: false},
  }
})
export default class ColorPanel extends Vue {
  model!: Model
  hideFilters!: boolean
  filteredCopyVisible: boolean = false
  filteredCopyTimeout: number = -1
  hexEditorFocused: boolean = false

  get hexEditorRef(): HTMLElement {
    return this.$refs['hexEditor'] as HTMLElement
  }

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
    return formatDecimal(this.model.hue, 2)
  }

  get saturationDisplay(): number {
    return Math.round(this.model.saturation * 100)
  }

  get exactSaturationDisplay(): string {
    return formatDecimal(this.model.saturation * 100, 2)
  }

  get lightnessDisplay(): number {
    return Math.round(this.model.lightness * 100)
  }

  get exactLightnessDisplay(): string {
    return formatDecimal(this.model.lightness * 100, 2)
  }

  get rawSwatchStyle() {
    return ColorPanel.swatchStyle(this.model.rawColor)
  }

  get filteredColor() {
    return this.hideFilters ? this.model.rawColor : this.model.computedColor
  }

  get filteredSwatchStyle() {
    return ColorPanel.swatchStyle(this.filteredColor)
  }

  hexEditorFocus() {
    this.hexEditorFocused = true

    // https://stackoverflow.com/a/3806004
    setTimeout(() => {
      let sel, range;
      if (window.getSelection && document.createRange) {
        range = document.createRange();
        range.selectNodeContents(this.hexEditorRef);
        sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 1);
  }

  hexEditorBlur() {
    this.hexEditorFocused = false
  }

  hexEditorChanged(event: InputEvent) {
    let hex = (event.target as HTMLElement).innerText
    if(chroma.valid(hex)) {
      this.model.rawColor = chroma(hex)
    }
  }

  hexEditorKeydown(event: KeyboardEvent) {
    if(event.key == "Enter") {
      event.preventDefault()
      this.hexEditorRef.blur()
    }
  }

  @Watch('hexEditorFocused')
  focusChanged() {
    if(!this.hexEditorFocused) {
      this.updateHexEditorText()
    }
  }

  @Watch('model.rawColor')
  rawColorChanged() {
    if(!this.hexEditorFocused) {
      this.updateHexEditorText()
    }
  }

  updateHexEditorText() {
    this.hexEditorRef.innerText = this.model.rawColor.hex().substring(1)
  }

  mounted() {
    this.updateHexEditorText()
  }

  copyFiltered() {
    navigator.clipboard.writeText(this.filteredColor.hex().substring(1).toUpperCase()).then(() => {
      this.filteredCopyVisible = true
      clearTimeout(this.filteredCopyTimeout)
      this.filteredCopyTimeout = setTimeout(() => {
        this.filteredCopyVisible = false
      }, 750)
    })
  }

  static swatchStyle(color: Color) {
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
  grid-template-rows: 35px 35px 35px 1fr auto;
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
  border: var(--standard-border);
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

.raw-swatch {
  grid-area: original;
  cursor: text;
}

.filtered-swatch {
  grid-area: filtered;
  cursor: default;
}

.hex-editor {
  display: inline-block;
}

</style>