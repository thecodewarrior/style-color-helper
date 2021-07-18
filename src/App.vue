<template>
  <div class="app">
    <color-picker :model="model"/>
    <div class="filter-options">
      <filter-editor v-for="(filter, i) in model.filters" :key="i" :filter="filter"/>
    </div>
    <div class="swatch" :style="{'background-color': model.computedColor.hex(), 'width': '300px'}">{{ model.computedColor.hex() }}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import ColorPicker from "@/components/ColorPicker.vue";
import {Filter, FilterSet, ParameterizedFilter} from "@/logic/Filter";
import {filterRegistry} from "@/logic/Filters";
import FilterEditor from "@/components/FilterEditor.vue";
import Model from "@/logic/Model";

@Options({
  components: {FilterEditor, ColorPicker},
  props: {
  }
})
export default class App extends Vue {
  model: Model = new Model()

  mounted() {
    let filter = this.model.addFilter(new ParameterizedFilter(filterRegistry["posterize"]))
    filter.values[0] = 5
  }
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.filter-options {
  margin-left: 15px;
}
</style>
