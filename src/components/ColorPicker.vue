<template>
  <div class="color-picker">
    <color-picker-spectrum v-model:h="h" :s="s" v-model:l="l" :filters="filters"></color-picker-spectrum>
    <div class="swatch" :style="{'background-color': finalColor, 'width': '300px'}">{{ finalColor }}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import {ColorFilter, PosterizeFilter} from "@/logic/ColorFilter";
import chroma, {Color} from "chroma-js";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";

@Options({
  components: {
    ColorPickerSpectrum
  },
})
export default class ColorPicker extends Vue {
  h = 30
  s = 1
  l = 0.75
  filters: ColorFilter[] = [
    new PosterizeFilter(5)
  ]

  get finalColor() {
    let color = chroma.hsl(this.h, this.s, this.l)
    for (const filter of this.filters) {
      color = filter.filter(color)
    }
    return color.hex()
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

}
</style>
