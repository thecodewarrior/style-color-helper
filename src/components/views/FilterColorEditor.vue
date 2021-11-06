<template>
  <div class="color-mode">
    <color-panel class="color-picker"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import {filterRegistry, filterMenu} from "@/logic/Filters";
import {ControlValue, ParameterizedFilter} from "@/logic/Filter";
import {vec3, vec4} from "@/logic/math/vec";
import chroma, {Color} from "chroma-js";
import ColorPanel from "@/components/ColorPanel.vue";
import {Inject, Provide, Watch} from "vue-property-decorator";

type PanelMode = 'filters' | 'add' | 'color' | 'save'

@Options({
  components: {
    ColorPanel,
  },
  props: {
    filterIndex: {type: Number, required: true},
    parameterIndex: {type: Number, required: true},
  },
})
export default class FilterColorEditor extends Vue {
  @Inject({from: 'model'})
  model!: Model
  filterIndex!: number
  parameterIndex!: number

  @Provide('model')
  subModel: Model = new Model()

  get controlValue(): ControlValue {
    return this.model.filters[this.filterIndex].values[this.parameterIndex]
  }

  set controlValue(value: ControlValue) {
    this.model.filters[this.filterIndex].values[this.parameterIndex] = value
  }

  get params() {
    return [this.filterIndex, this.parameterIndex]
  }

  @Watch('params')
  colorChanged() {
    let rgb = this.controlValue as vec3
    this.subModel.rawColor = chroma.gl(rgb.r, rgb.g, rgb.b)
  }

  @Watch('subModel.rawColor')
  colorEdited() {
    this.controlValue = new vec4(this.subModel.rawColor.gl()).rgb
  }
}
</script>

<style scoped>
.color-mode {
  display: grid;
  justify-items: stretch;
  align-items: stretch;
  width: 100%;
  height: 100%;
}
</style>