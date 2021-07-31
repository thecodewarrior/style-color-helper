<template>
  <div class="parameter-editor">
    <template v-if="parameter.type === 'number'">
      <number-input :control="parameter" :value="value" @input="input"></number-input>
    </template>
    <template v-if="parameter.type === 'stepper'">
      <input type="number" :min="stepperControl.min" :max="stepperControl.max" v-model="state"/>
    </template>
    <template v-else-if="parameter.type === 'slider'">
      <input type="range" :min="sliderControl.min" :max="sliderControl.max" :step="sliderControl.step" v-model="state"/>
    </template>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import {
  ControlValue,
  FilterControl,
  SliderControl,
  ColorControl, StepperControl
} from "@/logic/Filter";
import {PropType} from "vue";
import {vec3, vec4} from "@/logic/math/vec";
import NumberInput from "@/components/parameter/NumberInput.vue";

@Options({
  components: {NumberInput},
  props: {
    parameter: Object as PropType<FilterControl>,
    value: [Number, vec3, vec4] as PropType<ControlValue>
  },
  emits: [
    'input'
  ]
})
export default class ParameterEditor extends Vue {
  parameter!: FilterControl
  value!: ControlValue

  input(value: ControlValue) {
    this.$emit('input', value)
  }

  get state(): string {
    return `${this.value}`
  }

  set state(value: string) {
    switch (this.parameter.type) {
      case 'stepper':
        this.$emit('input', parseFloat(value))
        break;
      case 'slider':
        this.$emit('input', parseFloat(value))
        break;
    }
  }

  get sliderControl(): SliderControl {
    return this.parameter as SliderControl
  }
  get stepperControl(): StepperControl {
    return this.parameter as StepperControl
  }
  get colorControl(): ColorControl {
    return this.parameter as ColorControl
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
  justify-content: center;
}
.label {
  flex-grow: 1;
}
input[type="text"], input[type="number"] {
  font: inherit;
  color: inherit;
  background: var(--alt-background);
  border: 2px solid;
  border-top-color: var(--main-border);
  border-left-color: var(--main-border);
  border-bottom-color: var(--main-border);
  border-right-color: var(--main-border);
}
</style>
