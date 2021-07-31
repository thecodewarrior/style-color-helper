<template>
  <div class="number-input">
    <div v-if="useSteppers" class="stepper" @click="stepDown"><fa icon="minus"></fa></div>
    <input type="text"
           :class="{'invalid': !valid}"
           :inputmode="inputMode"
           v-model="state"
           @focus="focus"
           @blur="blur"
    />
    <div v-if="useSteppers" class="stepper" @click="stepUp"><fa icon="plus"></fa></div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import {NumberControl} from "@/logic/Filter";
import {PropType} from "vue";

@Options({
  components: {},
  props: {
    control: Object as PropType<NumberControl>,
    value: Number
  },
  emits: [
    'input'
  ],
  watch: {
    'value': 'valueChanged',
    'state': 'stateChanged'
  }
})
export default class NumberInput extends Vue {
  control!: NumberControl
  value!: number

  valid: boolean = true
  focused: boolean = false
  state: string = ''

  get useSteppers() {
    return this.control.step !== undefined
  }

  get inputMode() {
    return this.control.integer ? 'numeric' : 'decimal';
  }

  valueChanged() {
    if(!this.focused)
      this.updateState()
  }

  stateChanged() {
    let pattern = this.control.integer ? NumberInput.int_regex : NumberInput.float_regex
    this.valid = pattern.test(this.state)
    let value = parseFloat(this.state)
    this.valid &&= this.boundsCheck(value)
    if(!this.valid)
      return
    this.$emit('input', value)
  }

  stepDown() {
    let step = this.control.step
    if(step === undefined) return
    let value = this.value - step
    if(this.boundsCheck(value))
      this.$emit('input', value)
  }

  stepUp() {
    let step = this.control.step
    if(step === undefined) return
    let value = this.value + step
    if(this.boundsCheck(value))
      this.$emit('input', value)
  }

  boundsCheck(value: number): boolean {
    if(this.control.min !== undefined && value < this.control.min)
      return false
    if(this.control.max !== undefined && value > this.control.max)
      return false
    return true
  }

  focus() {
    this.focused = true
  }

  blur() {
    this.focused = false
    this.valid = true
    this.updateState()
  }

  mounted() {
    this.updateState()
  }

  private updateState() {
    this.state = `${this.value}`
  }

  static float_regex = /^\s*-?(?:\d*\.\d+|\d+\.\d*|\d+)\s*$/
  static int_regex = /^\s*-?\d+\s*$/
}
</script>

<style scoped>
.number-input {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.stepper {
  cursor: pointer;
}
input {
  font: inherit;
  color: inherit;
  background: var(--alt-background);
  border: 2px solid var(--main-border);
  width: 75px;
  margin: 0 10px;
  box-sizing: border-box;
}
</style>
