<template>
  <div class="color-picker">
    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        hue="x" :saturation="model.saturation" :lightness="model.lightness"
        v-model:x="hueAxis"
        :render-width="300" :render-height="1"
        :model="model"
    />
    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        :hue="model.hue" saturation="x" :lightness="model.lightness"
        v-model:x="model.saturation"
        :render-width="300" :render-height="1"
        :model="model"
    />
    <color-picker-spectrum
        style="width: 300px; height: 20px; margin-bottom: 10px"
        :hue="model.hue" :saturation="model.saturation" lightness="x"
        v-model:x="model.lightness"
        :render-width="300" :render-height="1"
        :model="model"
    />
    <color-picker-spectrum
        style="width: 300px; height: 120px;"
        hue="x" :saturation="model.saturation" lightness="-y"
        v-model:x="hueAxis" v-model:y="inverseLightness"
        :render-width="300" :render-height="120"
        :model="model"
    />
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import chroma from "chroma-js";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import {vec3} from "@/logic/math/vec";
import Model from "@/logic/Model";
import {PropType} from "vue";

@Options({
  components: {
    ColorPickerSpectrum
  },
  props: {
    model: {type: Object as PropType<Model>, required: true}
  },
  watch: {
  },
})
export default class ColorPicker extends Vue {
  model!: Model

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
}
</style>
