<template>
  <div class="component-row">
    <div class="component-label">{{label}}</div>
    <color-picker-spectrum
        :hue="hueAxis" :saturation="saturationAxis" :lightness="lightnessAxis"
        v-model:x="componentValue"
        :render-width="300" :render-height="1"
    />
    <div class="component-value">{{valueDisplay}}</div>
    <tippy placement="right" target="_parent" :extra="{hideOnClick: false}">{{exactValueDisplay}}</tippy>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import {PropType} from "vue";
import Tippy from "@/lib/Tippy.vue";
import {formatDecimal} from "@/utils";
import {Inject} from "vue-property-decorator";

@Options({
  components: {
    Tippy,
    ColorPickerSpectrum
  },
  props: {
    label: {type: String, required: true},
    component: {type: String as PropType<'hue' | 'saturation' | 'lightness'>, required: true},
  }
})
export default class ColorComponent extends Vue {
  @Inject({from: 'model'})
  model!: Model
  component!: 'hue' | 'saturation' | 'lightness'

  get hueAxis() {
    return this.component == 'hue' ? 'x' : this.model.hue
  }
  get saturationAxis() {
    return this.component == 'saturation' ? 'x' : this.model.saturation
  }
  get lightnessAxis() {
    return this.component == 'lightness' ? 'x' : this.model.lightness
  }

  get componentValue() {
    switch (this.component) {
      case "hue":
        return this.model.normalHue
      case "saturation":
        return this.model.saturation
      case "lightness":
        return this.model.lightness
    }
    return 0
  }

  set componentValue(value: number) {
    switch (this.component) {
      case "hue":
        this.model.normalHue = value
        break;
      case "saturation":
        this.model.saturation = value
        break;
      case "lightness":
        this.model.lightness = value
        break;
    }
  }

  get valueDisplay() {
    switch (this.component) {
      case "hue":
        return Math.round(this.model.hue)
      case "saturation":
        return Math.round(this.model.saturation * 100)
      case "lightness":
        return Math.round(this.model.lightness * 100)
    }
    return ''
  }

  get exactValueDisplay() {
    switch (this.component) {
      case "hue":
        return formatDecimal(this.model.hue, 2)
      case "saturation":
        return formatDecimal(this.model.saturation * 100, 2)
      case "lightness":
        return formatDecimal(this.model.lightness * 100, 2)
    }
    return ''
  }
}
</script>

<style scoped>
.component-row {
  display: grid;
  grid-template-columns: auto 1fr 35px;
  padding-left: 4px;
  padding-right: 3px;
  height: 20px;

  background: var(--alt-background);
  border: var(--standard-border);
  border-radius: 100px;
}

.component-label {
  border-right: var(--standard-border);
  text-align: right;
  padding-right: 3px;
}

.component-value {
  border-left: var(--standard-border);
  text-align: center;
}
</style>
