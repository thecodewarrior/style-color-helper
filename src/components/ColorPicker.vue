<template>
  <div class="color-picker">
    <!--    <color-picker-handle label="H" :min="0" :max="360" v-model:component="h" :h="null" :s="s" :l="l" :filters="filters"></color-picker-handle>-->

    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        hue="x" :saturation="saturation" :lightness="lightness"
        v-model:x="hueAxis"
        :render-width="300" :render-height="1"
        :filters="filters"
    />
    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        :hue="hue" saturation="x" :lightness="lightness"
        v-model:x="saturation"
        :render-width="300" :render-height="1"
        :filters="filters"
    />
    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        :hue="hue" :saturation="saturation" lightness="x"
        v-model:x="lightness"
        :render-width="300" :render-height="1"
        :filters="filters"
    />
    <color-picker-spectrum
        style="width: 300px; height: 120px;"
        hue="x" :saturation="saturation" lightness="-y"
        v-model:x="hueAxis" v-model:y="inverseLightness"
        :render-width="300" :render-height="120"
        :filters="filters"
    />
    <div class="swatch" :style="{'background-color': finalColor, 'width': '300px'}">{{ finalColor }}</div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {FilterSet} from "@/logic/Filter";
import chroma from "chroma-js";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import {PropType} from "vue";
import {vec3} from "@/logic/math/vec";

@Options({
  components: {
    ColorPickerSpectrum
  },
  props: {
    filters: {type: Array as PropType<FilterSet>, required: true}
  },
  watch: {
  },
})
export default class ColorPicker extends Vue {
  filters!: FilterSet
  hue = 30
  saturation = 1
  lightness = 0.75

  get finalColor() {
    let rgb = chroma.hsl(this.hue, this.saturation, this.lightness).rgb()
    let color = new vec3(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)
    for(let filter of this.filters) {
      color = filter.apply(color)
    }
    return chroma.rgb(color.r * 255, color.g * 255, color.b * 255).hex()
  }

  get hueAxis(): number {
    return this.hue / 360
  }

  set hueAxis(value: number) {
    this.hue = value * 360
  }

  get inverseLightness(): number {
    return 1 - this.lightness
  }

  set inverseLightness(value: number) {
    this.lightness = 1 - value
  }

  updateCanvas() {
  }

  mounted() {
    console.log("me too")
    this.updateCanvas()
  }
}
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #1a283d;
  border: 4px solid #0fb1ad;
  border-radius: 8px;
}
</style>
