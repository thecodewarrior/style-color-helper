<template>
  <canvas ref="spectrum" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ColorFilter} from "@/logic/ColorFilter";
import chroma, {Color} from "chroma-js";
import {PropType, resolveComponent} from "vue";
import {clamp} from "@/utils";

export type SpectrumComponent = number | "x" | "-x" | "y" | "-y"
type Margins = [number] | [number, number] | [number, number, number, number]

@Options({
  components: {},
  props: {
    hue: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    saturation: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    lightness: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    filter: {type: Object as PropType<ColorFilter>, required: true},
    margin: {type: Object as PropType<Margins>, required: false, default: [0]},
  },
  emits: [
    'update:h',
    'update:s',
    'update:l',
  ],
  watch: {
    'hue': 'colorChanged',
    'saturation': 'colorChanged',
    'lightness': 'colorChanged',
    'width': 'geometryChanged',
    'height': 'geometryChanged',
    'filter': 'geometryChanged',
    'margin': 'geometryChanged',
  }
})
export default class ColorSpectrum extends Vue {
  hue!: SpectrumComponent
  saturation!: SpectrumComponent
  lightness!: SpectrumComponent
  margin!: Margins
  width!: number
  height!: number
  filter!: ColorFilter

  colorChanged(newValue: any) {
    if (!(newValue instanceof String))
      this.updateCanvas()
  }

  geometryChanged() {
    this.updateCanvas()
  }

  mounted() {
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
      for (let y = 0; y < height; y++) {
        let color = this.getColor(x, y)
        const rgb = this.filter.apply(color).rgb()

        const i = y * stride + x * 4
        data[i] = rgb[0]     // red
        data[i + 1] = rgb[1] // green
        data[i + 2] = rgb[2] // blue
        data[i + 3] = 255    // alpha
      }
    }

    ctx.putImageData(image, 0, 0)
  }

  /**
   * Gets the 0–1 X coordinate, taking into account margins
   */
  private getFractionalX(x: number): number {
    let leftMargin: number = 0
    let rightMargin: number = 0
    switch (this.margin.length) {
      case 1:
        leftMargin = this.margin[0]
        rightMargin = this.margin[0]
        break;
      case 2:
        leftMargin = this.margin[1]
        rightMargin = this.margin[1]
        break;
      case 4:
        rightMargin = this.margin[1]
        leftMargin = this.margin[3]
        break;
    }

    let innerWidth = this.width - leftMargin - rightMargin
    return clamp(0, (x - leftMargin) / innerWidth, 1)
  }

  /**
   * Gets the 0–1 Y coordinate, taking into account margins
   */
  private getFractionalY(y: number): number {
    let topMargin: number = 0
    let bottomMargin: number = 0
    switch (this.margin.length) {
      case 1:
      case 2:
        topMargin = this.margin[0]
        bottomMargin = this.margin[0]
        break;
      case 4:
        bottomMargin = this.margin[0]
        topMargin = this.margin[2]
        break;
    }

    let innerWidth = this.height - topMargin - bottomMargin
    return clamp(0, (y - topMargin) / innerWidth, 1)
  }

  /**
   * Gets the resolved color for the given position
   * @param x the fractional X coordinate
   * @param y the fractional Y coordinate
   * @private
   */
  private getColor(x: number, y: number): Color {
    x = this.getFractionalX(x)
    y = this.getFractionalY(y)

    return chroma.hsl(
        ColorSpectrum.resolveComponent(x, y, this.hue, 360),
        ColorSpectrum.resolveComponent(x, y, this.saturation),
        ColorSpectrum.resolveComponent(x, y, this.lightness),
    )
  }

  private static resolveComponent(x: number, y: number, component: SpectrumComponent, multiplier: number = 1): number {
    switch (component) {
      case "x":
        return x * multiplier
      case "-x":
        return (1 - x) * multiplier
      case "y":
        return y * multiplier
      case "-y":
        return (1 - y) * multiplier
    }
    return component
  }
}
</script>

<style scoped>
</style>
