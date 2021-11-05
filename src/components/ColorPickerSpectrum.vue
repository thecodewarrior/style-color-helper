<template>
  <div class="color-picker-spectrum" :style="cornerStyles.outer" @mousedown="startMouse" @touchstart="startTouch">
    <spectrum
        class="spectrum"
        ref="spectrum"
        :style="cornerStyles.inner"
        :hue="hue"
        :saturation="saturation"
        :lightness="lightness"
        :width="renderWidth"
        :height="renderHeight"
        :model="model"
        :hide-filters="hideFilters"
    ></spectrum>
    <div class="cursor-area" ref="cursorArea">
      <div class="cursor" :style="cursorStyle"></div>
    </div>

  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {PropType} from "vue";
import {DragDelegate, DragHandler} from "@/logic/DragDelegate";
import ColorSpectrum, {SpectrumComponent} from "@/components/ColorSpectrum.vue";
import {clamp} from "@/utils";
import Model from "@/logic/Model";

type BorderSettings = {radius: number, width: number, transition: string}

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
    border: {type: Object as PropType<BorderSettings>, required: false},
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
  border?: BorderSettings

  get cursorStyle() {
    return {
      left: this.x * 100 + '%',
      top: this.y * 100 + '%',
    }
  }

  fractionalDrag: boolean = true

  get dragElement(): HTMLElement {
    return this.$refs.cursorArea
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

  lastSpectrumSize: {width: number, height: number} = {width: 0, height: 0}

  spectrumSize(): {width: number, height: number} {
    let main = this.$refs.spectrum
    if(main) {
      let {width, height} = (main.$el as HTMLElement).getBoundingClientRect();
      if(width !== 0 && height !== 0) {
        this.lastSpectrumSize = {width, height}
      }
    }
    return this.lastSpectrumSize
  }

  get cornerStyles() {
    if(!this.border)
      return {}

    let {width, height} = this.spectrumSize()
    if(width === 0 || height === 0) return {}

    let x = this.x * width
    let y = this.y * height

    let pad = this.border.radius + 5;
    let left = x < pad;
    let right = width - x < pad;
    let top = y < pad;
    let bottom = height - y < pad;

    let outerRadius = this.border.radius + 'px'
    let innerRadius = (this.border.radius - this.border.width) + 'px'
    let s = {
      outer: {
        'transition': 'border-radius ' + this.border.transition,
        'border-top-left-radius': top && left ? '1px' : outerRadius,
        'border-bottom-left-radius': bottom && left ? '1px' : outerRadius,
        'border-top-right-radius': top && right ? '1px' : outerRadius,
        'border-bottom-right-radius': bottom && right ? '1px' : outerRadius,
      },
      inner: {
        'transition': 'border-radius ' + this.border.transition,
        'border-top-left-radius': top && left ? 0 : innerRadius,
        'border-bottom-left-radius': bottom && left ? 0 : innerRadius,
        'border-top-right-radius': top && right ? 0 : innerRadius,
        'border-bottom-right-radius': bottom && right ? 0 : innerRadius,
      }
    }
    return s
  }

}
</script>

<style scoped>
.color-picker-spectrum {
  position: relative;
  user-select: none;
  touch-action: none;
  overflow: hidden;
}

.cursor {
  position: absolute;
  width: 16px;
  height: 16px;
  margin: -8px;
  background: url("../assets/cursor.svg");
}

.cursor-area {
  width: 100%;
  height: 100%;
}

.spectrum {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
