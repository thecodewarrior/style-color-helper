<template>
  <div class="color-picker-spectrum" @mousedown="startMouse" @touchstart="startTouch">
    <spectrum
        class="spectrum"
        :hue="hue"
        :saturation="saturation"
        :lightness="lightness"
        :width="renderWidth"
        :height="renderHeight"
        :model="model"
        :hide-filters="hideFilters"
    ></spectrum>
    <div class="cursor" :style="cursorStyle"></div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {PropType} from "vue";
import {DragDelegate, DragHandler} from "@/logic/DragDelegate";
import ColorSpectrum, {SpectrumComponent} from "@/components/ColorSpectrum.vue";
import {clamp} from "@/utils";
import Model from "@/logic/Model";

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
    model: {type: Object as PropType<Model>, required: true},
    hideFilters: {type: Boolean, default: false},
  },
  emits: [
    'update:x',
    'update:y',
  ],
  watch: {}
})
export default class ColorPickerSpectrum extends Vue implements DragDelegate {
  x!: number
  y!: number

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

  dragMouse(x: number, y: number) {
    this.drag(x, y)
  }

  touchEnd(x: number, y: number): void {
    this.drag(x, y)
  }

  dragTouch(x: number, y: number) {
    this.drag(x, y)
  }

  drag(x: number, y: number) {
    this.$emit('update:x', clamp(0, x, 1))
    this.$emit('update:y', clamp(0, y, 1))
  }

  startMouse(e: MouseEvent) {
    DragHandler.startMouse(this, e)
  }

  startTouch(e: TouchEvent) {
    DragHandler.startTouch(this, e)
  }
}
</script>

<style scoped>
.color-picker-spectrum {
  position: relative;
  user-select: none;
  touch-action: none;
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
