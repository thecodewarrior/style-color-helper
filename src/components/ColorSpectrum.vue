<template>
  <canvas ref="spectrum" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ColorFilter} from "@/logic/ColorFilter";
import chroma, {Color} from "chroma-js";
import {PropType, resolveComponent} from "vue";
import {clamp} from "@/utils";
let styleRenderer = import("style-renderer")

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
    console.log("wtf")
    this.updateCanvas()
  }

  updateCanvas() {
    styleRenderer.then((renderer) => {
      const canvas = this.$refs['spectrum'] as HTMLCanvasElement
      const ctx = canvas.getContext('2d')!

      let xAxis = renderer.Component.None
      let yAxis = renderer.Component.None
      let invertX = false
      let invertY = false

      function resolveComponent(component: SpectrumComponent, renderComponent: number): number {
        switch (component) {
          case "x":
            xAxis = renderComponent
            invertX = false
            break;
          case "-x":
            xAxis = renderComponent
            invertX = true
            break;
          case "y":
            yAxis = renderComponent
            invertY = false
            break;
          case "-y":
            yAxis = renderComponent
            invertY = true
            break;
          default:
            return component
        }
        return 0
      }

      let hue = resolveComponent(this.hue, renderer.Component.Hue)
      let saturation = resolveComponent(this.saturation, renderer.Component.Saturation)
      let lightness = resolveComponent(this.lightness, renderer.Component.Lightness)

      let data = renderer.render_spectrum(canvas.width, canvas.height, hue / 360, saturation, lightness, xAxis, invertX, yAxis, invertY)

      ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0)
    })
  }
}
</script>

<style scoped>
</style>
