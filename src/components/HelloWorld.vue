<template>
  <div class="hello">
    <div class="area">
      <color-picker :filters="filters"></color-picker>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import ColorPicker from "@/components/ColorPicker.vue";
import {Filter, FilterSet, ParameterizedFilter} from "@/logic/Filter";
import {filterRegistry} from "@/logic/Filters";

@Options({
  components: {ColorPicker},
  props: {
    msg: String
  }
})
export default class HelloWorld extends Vue {
  filters: FilterSet = []

  addFilter(filter: ParameterizedFilter): ParameterizedFilter {
    this.filters.push(filter)
    return this.filters[this.filters.length - 1]
  }

  mounted() {
    let filter = this.addFilter(new ParameterizedFilter(filterRegistry["posterize"]))
    filter.parameters[0] = 5
    setTimeout(() => {
      const start = performance.now() / 1000
      setInterval(() => {
        let now = performance.now() / 1000
        let delta = now - start
        let sin = Math.sin(delta / 2) / 2 + 0.5
        filter.parameters.splice(0, 1, 1 + sin * 5)
      }, 25)
    }, 1500)
  }
}
</script>

<style scoped>
.area {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
