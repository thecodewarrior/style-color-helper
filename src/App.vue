<template>
  <div class="app">
    <color-panel :model="model" :hide-filters="hideFilters"/>
    <div class="panel-separator"></div>
    <filter-panel :model="model" v-model:hide-filters="hideFilters"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ParameterizedFilter} from "@/logic/Filter";
import {filterRegistry} from "@/logic/Filters";
import Model from "@/logic/Model";
import ColorPanel from "@/components/ColorPanel.vue";
import FilterPanel from "@/components/FilterPanel.vue";

@Options({
  components: {FilterPanel, ColorPanel},
  props: {}
})
export default class App extends Vue {
  model: Model = new Model()
  hideFilters: boolean = false
  mounted() {
    this.model.addFilter(new ParameterizedFilter(filterRegistry["posterize"])).values[0] = 3
    // let filter = this.model.addFilter(new ParameterizedFilter(filterRegistry["blend_normal"]))
    // filter.values[0] = new vec3(1, 0, 1)

    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
    this.model.addFilter(new ParameterizedFilter(filterRegistry["brightness_contrast"]))
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&display=swap');

:root {
  --alt-background: #001119;
  --main-highlight: #0fb1ad;
  --main-background: #1a283d;
  --main-border: #1a1c31;
  --standard-border: 5px solid var(--main-border);
}

body {
  background-color: var(--alt-background);
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;

  font-family: 'Roboto Mono', sans-serif;
  color: var(--main-highlight);
  font-weight: 600;
  font-size: 14px;
}
</style>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 300px 30px 300px;
  grid-template-rows: 300px;
  padding: 20px;

  background: var(--main-background);
  border: 5px solid var(--main-highlight);
  border-radius: 20px;
}

.panel-separator {
  width: 5px;

  background-color: var(--main-highlight);
  border-radius: 3px;

  margin: -10px 0;
  justify-self: center;
}

@media (max-width: 700px) {
  .app {
    grid-template-columns: auto;
    grid-template-rows: 300px 30px auto;
  }

  .panel-separator {
    width: auto;
    height: 5px;
    margin: 0 -10px;

    justify-self: stretch;
    align-self: center;
  }
}

</style>
