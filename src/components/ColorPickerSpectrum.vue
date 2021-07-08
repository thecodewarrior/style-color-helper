<template>
  <div class="spectrum" :style="rootStyle" @mousedown="startDrag()">
    <div class="cursor" :style="cursorStyle"></div>
    <canvas ref="spectrum" :width="width" :height="height"></canvas>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import {ColorFilter} from "@/logic/ColorFilter";
import chroma, {Color} from "chroma-js";
import {PropType} from "vue";
import {DragDelegate, DragHandler} from "@/logic/DragDelegate";

@Options({
  components: {
  },
  props: {
    h: Number,
    s: Number,
    l: Number,
    filters: Array as PropType<ColorFilter[]>,
  },
  emits: [
    'update:h',
    'update:l'
  ],
  watch: {
    's': 'saturationChanged'
  }
})
export default class ColorPickerSpectrum extends Vue implements DragDelegate {
  h!: number
  s!: number
  l!: number
  filters!: ColorFilter[]

  width = 300
  height = 120

  get rootStyle() {
    return {
      width: this.width + 'px',
      height: this.height + 'px',
    }
  }

  get cursorStyle() {
    let cursorX = this.h / 360
    let cursorY = this.l
    return {
      left: cursorX * 100 + '%',
      bottom: cursorY * 100 + '%',
    }
  }

  saturationChanged(newColor: number, oldColor: number) {
    this.updateCanvas()
  }

  updateCanvas() {
    const canvas = this.$refs['spectrum'] as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    const image = ctx.createImageData(canvas.width, canvas.height)
    const data = image.data

    const width = canvas.width
    const height = canvas.height
    const stride = width * 4

    for (let x = 0; x < width; x++) {
      for(let y = 0; y < height; y++) {
        const hue = x * 360.0 / width
        let lightness = 1 - y / height;

        let color = chroma.hsl(hue, this.s, lightness)
        for (const filter of this.filters) {
          color = filter.filter(color)
        }

        const rgb = color.rgb()
        const i = y * stride + x * 4
        data[i] = rgb[0]     // red
        data[i + 1] = rgb[1] // green
        data[i + 2] = rgb[2] // blue
        data[i + 3] = 255    // alpha
      }
    }

    ctx.putImageData(image, 0, 0)
  }

  get dragElement(): HTMLElement {
    return this.$refs['spectrum'] as HTMLElement
  }

  dragEnd(x: number, y: number): void {
    this.drag(x, y)
  }

  drag(x: number, y: number) {
    x = x < 0 ? 0 : x > this.width ? 1 : x / this.width
    y = y < 0 ? 0 : y > this.height ? 1 : y / this.height
    this.$emit('update:h', x * 360)
    this.$emit('update:l',  1 - y)
  }

  startDrag() {
    DragHandler.start(this)
  }

  mounted() {
    this.updateCanvas()
    console.log("me")
  }
}
</script>

<style>
.spectrum {
  position: relative;
}

.cursor {
  position: absolute;
  width: 16px;
  height: 16px;
  margin: -8px;
  background: url("../assets/cursor.svg");
}
</style>
