<template>
  <div class="hello">
    <div class="area">
      <color-picker :filters="filters"/>
      <div class="filter-options">
        <filter-editor v-for="(filter, i) in filters" :key="i" :filter="filter"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import ColorPicker from "@/components/ColorPicker.vue";
import {Filter, FilterSet, ParameterizedFilter} from "@/logic/Filter";
import {filterRegistry} from "@/logic/Filters";
import FilterEditor from "@/components/FilterEditor.vue";

@Options({
  components: {FilterEditor, ColorPicker},
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
    filter.values[0] = 5
  }
}
</script>

<style scoped>
.area {
  display: flex;
  flex-direction: row;
  align-items: start;
}
.filter-options {
  margin-left: 15px;
}
</style>
