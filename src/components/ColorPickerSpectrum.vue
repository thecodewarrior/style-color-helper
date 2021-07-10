<template>
  <div class="color-picker-spectrum" @mousedown="startDrag()">
    <spectrum
        class="spectrum"
        :hue="hue"
        :saturation="saturation"
        :lightness="lightness"
        :width="renderWidth"
        :height="renderHeight"
        :filter="filter"
    ></spectrum>
    <div class="cursor" :style="cursorStyle"></div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ColorFilter} from "@/logic/ColorFilter";
import chroma from "chroma-js";
import {PropType} from "vue";
import {DragDelegate, DragHandler} from "@/logic/DragDelegate";
import ColorSpectrum, {SpectrumComponent} from "@/components/ColorSpectrum.vue";
import {clamp} from "@/utils";

@Options({
  components: {
    Spectrum: ColorSpectrum
  },
  props: {
    hue: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    saturation: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    lightness: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    x: {type: Number, required: false, default: 0.5},
    y: {type: Number, required: false, default: 0.5},
    renderWidth: {type: Number, required: true},
    renderHeight: {type: Number, required: true},
    filter: {type: Object as PropType<ColorFilter>, required: true},
  },
  emits: [
    'update:x',
    'update:y',
  ],
  watch: {}
})
export default class ColorPickerSpectrum extends Vue implements DragDelegate {
  hue!: SpectrumComponent
  saturation!: SpectrumComponent
  lightness!: SpectrumComponent
  x!: number
  y!: number
  renderWidth!: number
  renderHeight!: number
  filter!: ColorFilter

  get cursorStyle() {
    return {
      left: this.x * 100 + '%',
      top: this.y * 100 + '%',
    }
  }

  fractionalDrag: boolean = true

  get dragElement(): HTMLElement {
    return this.$el
  }

  dragEnd(x: number, y: number): void {
    this.drag(x, y)
  }

  drag(x: number, y: number) {
    this.$emit('update:x', clamp(0, x, 1))
    this.$emit('update:y', clamp(0, y, 1))
  }

  startDrag() {
    DragHandler.start(this)
  }
}
</script>

<style scoped>
.color-picker-spectrum {
  position: relative;
}

.cursor {
  position: absolute;
  width: 16px;
  height: 16px;
  margin: -8px;
  background: url("../assets/cursor.svg");
}

.spectrum {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
