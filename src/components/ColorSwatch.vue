<template>
  <div class="swatch" :style="style" @click="copyFiltered">
    {{ color.hex() }}
    <tippy target="_parent" trigger="manual" :visible="copyVisible">Copied</tippy>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import {Color} from "chroma-js";
import {PropType} from "vue";
import Tippy from "@/lib/Tippy.vue";
import {swatchStyle} from "@/utils";

@Options({
  components: {
    Tippy,
    ColorPickerSpectrum
  },
  props: {
    color: {type: Object as PropType<Color>, required: true},
  }
})
export default class ColorSwatch extends Vue {
  color!: Color
  copyVisible: boolean = false
  copyTimeout: number = -1

  get style() {
    return swatchStyle(this.color)
  }

  copyFiltered() {
    navigator.clipboard.writeText(this.color.hex().substring(1).toUpperCase()).then(() => {
      this.copyVisible = true
      clearTimeout(this.copyTimeout)
      this.copyTimeout = setTimeout(() => {
        this.copyVisible = false
      }, 750)
    })
  }
}
</script>

<style scoped>
.swatch {
  text-align: center;
  font-family: 'Roboto Mono', sans-serif;
  text-transform: uppercase;
  cursor: default;
}
</style>