<template>
  <div class="color-panel">
    <color-component
        :model="model" component="hue" label="H"
        style="grid-area: hue;"
    />
    <color-component
        :model="model" component="saturation" label="S"
        style="grid-area: saturation;"
    />
    <color-component
        :model="model" component="lightness" label="L"
        style="grid-area: lightness;"
    />
    <color-picker-spectrum
        class="main-spectrum"
        hue="x" :saturation="model.saturation" lightness="-y"
        v-model:x="model.normalHue" v-model:y="model.lightness"
        :render-width="300" :render-height="100"
        :model="model"
        :border="{radius: 20, width: 5, transition: '0.5s'}"
        style="grid-area: main;"
    />
    <color-edit-swatch style="grid-area: original;" v-model:color="model.rawColor"/>
    <color-swatch style="grid-area: filtered;" :color="model.filteredColor"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import chroma, {Color} from "chroma-js";
import {PropType} from "vue";
import Tippy from "@/lib/Tippy.vue";
import {formatDecimal} from "@/utils";
import {Watch} from "vue-property-decorator";
import ColorComponent from "@/components/ColorComponent.vue";
import ColorSwatch from "@/components/ColorSwatch.vue";
import ColorEditSwatch from "@/components/ColorEditSwatch.vue";

@Options({
  components: {
    ColorEditSwatch,
    ColorSwatch,
    ColorComponent,
    Tippy,
    ColorPickerSpectrum
  },
  props: {
    model: {type: Object as PropType<Model>, required: true},
    hideMainSpectrum: {type: Boolean, default: false},
  }
})
export default class ColorPanel extends Vue {
  model!: Model
}
</script>

<style scoped>
.color-panel {
  display: grid;
  grid-template-rows: 35px 35px 35px 1fr auto;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
      "hue hue"
      "saturation saturation"
      "lightness lightness"
      "main main"
      "original filtered";
  column-gap: 15px;
}

.main-spectrum {
  margin-bottom: 10px;
  border: var(--standard-border);
}

.swatch {
  padding: 15px 0;
  font-size: 20px;
  border: var(--standard-border);
  border-radius: 20px;
}
</style>