<template>
  <div class="parameter-editor">
    <template v-if="parameter.type === 'float'">
      <input type="number" :min="floatParameter.min" :max="floatParameter.max" v-model="state"/>
    </template>

  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import ColorPicker from "@/components/ColorPicker.vue";
import {
  Filter,
  FilterSet,
  ParameterValue,
  ParameterizedFilter,
  Parameter,
  FloatParameter,
  IntParameter, RgbaParameter, RgbParameter
} from "@/logic/Filter";
import {filterRegistry} from "@/logic/Filters";
import {PropType} from "vue";
import {vec3, vec4} from "@/logic/math/vec";

@Options({
  components: {},
  props: {
    parameter: Object as PropType<Parameter>,
    value: [Number, vec3, vec4] as PropType<ParameterValue>
  },
  emits: [
    'input'
  ]
})
export default class ParameterEditor extends Vue {
  parameter!: Parameter
  value!: ParameterValue

  get state(): string {
    return `${this.value}`
  }

  set state(value: string) {
    // if(this.useWorkingState)
    //   this.workingState = value
    // let validated = validate(this.parameter, value)
    // if(validated)
    if(this.parameter.type === 'float')
      this.$emit('input', parseFloat(value))
  }

  get floatParameter(): FloatParameter {
    return this.parameter as FloatParameter
  }
  get intParameter(): IntParameter {
    return this.parameter as IntParameter
  }
  get rgbParameter(): RgbParameter {
    return this.parameter as RgbParameter
  }
  get rgbaParameter(): RgbaParameter {
    return this.parameter as RgbaParameter
  }

  mounted() {
  }
}
</script>

<style scoped>
.parameter-editor {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
