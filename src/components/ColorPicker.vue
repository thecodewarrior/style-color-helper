<template>
  <div class="color-picker">
    <!--    <color-picker-handle label="H" :min="0" :max="360" v-model:component="h" :h="null" :s="s" :l="l" :filters="filters"></color-picker-handle>-->

    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        hue="x" :saturation="saturation" :lightness="lightness"
        v-model:x="hueAxis"
        :render-width="300" :render-height="1"
        :filter="filter"
    />
    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        :hue="hue" saturation="x" :lightness="lightness"
        v-model:x="saturation"
        :render-width="300" :render-height="1"
        :filter="filter"
    />
    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        :hue="hue" :saturation="saturation" lightness="x"
        v-model:x="lightness"
        :render-width="300" :render-height="1"
        :filter="filter"
    />
    <color-picker-spectrum
        style="width: 300px; height: 120px;"
        hue="x" :saturation="saturation" lightness="-y"
        v-model:x="hueAxis" v-model:y="inverseLightness"
        :render-width="300" :render-height="120"
        :filter="filter"
    />
    <div class="swatch" :style="{'background-color': finalColor, 'width': '300px'}">{{ finalColor }}</div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ColorFilter, CompoundFilter, PosterizeFilter} from "@/logic/ColorFilter";
import chroma, {Color} from "chroma-js";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";

@Options({
  components: {
    ColorPickerSpectrum
  },
})
export default class ColorPicker extends Vue {
  hue = 30
  saturation = 1
  lightness = 0.75
  filter: CompoundFilter = new CompoundFilter([
    new PosterizeFilter(5)
  ])

  get finalColor() {
    let color = this.filter.apply(chroma.hsl(this.hue, this.saturation, this.lightness))
    return color.hex()
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
