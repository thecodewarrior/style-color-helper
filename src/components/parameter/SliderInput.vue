<template>
  <div class="slider-input">
    <number-input
        v-show="textMode"
        :control="numberControl"
        :value="roundedValue"
        @input="emitValue($event)"
    />
    <input v-show="!textMode"
           v-tippy
           type="range"
           :min="control.min" :max="control.max"
           :value="value"
           :step="control.snap"
           @input="emitValue($event.target.value)"
    >
    <div class="icon-button filter-show" @click.stop="toggleText">
      <fa :icon="textMode ? 'sliders-h' : 'i-cursor'"/>
    </div>

    <tippy placement="right" :extra="{hideOnClick: false}">{{valueDisplay}}</tippy>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import {NumberControl, SliderControl} from "@/logic/Filter";
import {PropType} from "vue";
import NumberInput from "@/components/parameter/NumberInput.vue";
import {formatDecimal, roundDecimals} from "@/utils";
import Tippy from "@/lib/Tippy.vue";

@Options({
  name: 'slider-input',
  components: {Tippy, NumberInput},
  props: {
    control: Object as PropType<SliderControl>,
    value: Number
  },
  emits: [
    'input'
  ],
})
export default class SliderInput extends Vue {
  control!: SliderControl
  value!: number

  textMode: boolean = false

  get numberControl(): NumberControl {
    return {
      name: '',
      type: 'number',
      default: this.control.default,
      min: this.control.min,
      max: this.control.max,
      step: this.control.step,
      integer: this.control.precision === 0,
    }
  }

  get roundedValue(): number {
    return roundDecimals(this.value, this.control.precision)
  }

  get valueDisplay(): string {
    return formatDecimal(this.value, this.control.precision)
  }

  emitValue(value: number) {
    this.$emit('input', roundDecimals(value, this.control.precision))
  }

  toggleText() {
    this.textMode = !this.textMode
  }
}
</script>

<style scoped>
.slider-input {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.icon-button {
  font-size: 1.2em;
  width: 1.25em;
  align-self: stretch;
  text-align: center;
  cursor: pointer;
}
</style>
