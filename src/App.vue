<template>
  <div class="app">
    <color-panel class="main-panel" :model="model" :hide-filters="hideFilters" :hide-main-spectrum="true"/>
    <div class="sticky-block">
      <color-picker-spectrum
          class="sticky-spectrum"
          hue="x" :saturation="model.saturation" lightness="-y"
          v-model:x="hueAxis" v-model:y="inverseLightness"
          :render-width="3000" :render-height="1200"
          :model="model"
          :hide-filters="hideFilters"
          :border="{radius: 20, width: 5, transition: '0.5s'}"
      />
      <div class="swatch raw-swatch" :style="rawSwatchStyle">{{ model.rawColor.hex() }}</div>
      <div class="swatch filtered-swatch" :style="filteredSwatchStyle">{{ filteredColor.hex() }}</div>
      <div class="sticky-separator"></div>
    </div>
    <div class="sticky-mask"/>
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
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";

@Options({
  components: {ColorPickerSpectrum, FilterPanel, ColorPanel},
  props: {}
})
export default class App extends Vue {
  model: Model = new Model()
  hideFilters: boolean = false
  mounted() {
    this.model.addFilter(new ParameterizedFilter(filterRegistry["posterize"])).values[0] = 3
  }

  get hueAxis(): number {
    return this.model.hue / 360
  }

  set hueAxis(value: number) {
    this.model.hue = value * 360
  }

  get inverseLightness(): number {
    return 1 - this.model.lightness
  }

  set inverseLightness(value: number) {
    this.model.lightness = 1 - value
  }

  get rawSwatchStyle() {
    return ColorPanel.swatchStyle(this.model.rawColor)
  }

  get filteredColor() {
    return this.hideFilters ? this.model.rawColor : this.model.computedColor
  }

  get filteredSwatchStyle() {
    return ColorPanel.swatchStyle(this.filteredColor)
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&display=swap');
@import 'tippy.css';

:root {
  --alt-background: #001119;
  --main-highlight: #0fb1ad;
  --main-background: #1a283d;
  --main-border: #1a1c31;
  --standard-border: 5px solid var(--main-border);

  --standard-scroll-color: var(--main-highlight) transparent;
  --standard-scroll-width: thin;

  font-family: 'Roboto Mono', sans-serif;
  color: var(--main-highlight);
  font-weight: 600;
  font-size: 14px;
}

body {
  margin: 0;
  background-color: var(--alt-background);
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

@media (max-width: 700px) {
  #app {
    margin-top: 0;
    height: 100vh;
  }
}
</style>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 300px 30px 300px;
  grid-template-rows: 300px;
  grid-template-areas: "main sep filters";
  padding: 20px;

  background: var(--main-background);
  border: 5px solid var(--main-highlight);
  border-radius: 20px;
}

.panel-separator {
  grid-area: sep;
  width: 5px;

  background-color: var(--main-highlight);
  border-radius: 3px;

  margin: -10px 0;
  justify-self: center;
  z-index: 2;
}

.main-panel {
  grid-area: main;
  z-index: 2;
}

.sticky-mask {
  display: none;
}

.sticky-block {
  display: none;
}

@media (max-width: 700px) {
  .app {
    grid-template-columns: auto;
    grid-template-rows: 300px 29px auto;
    grid-template-areas: "main" "sep" "filters";
    max-height: 100vh;
    overflow-y: scroll;
    -webkit-scrollbar-color: var(--standard-scroll-color);
    -webkit-scrollbar-width: var(--standard-scroll-width);
    scrollbar-color: var(--standard-scroll-color);
    scrollbar-width: var(--standard-scroll-width);
  }

  .panel-separator {
    width: auto;
    height: 5px;
    margin: 12px -10px;

    justify-self: stretch;
    align-self: center;
  }

  .sticky-mask {
    display: block;
    margin: 0 -10px 12px;
    height: 150px;
    background: var(--main-background);
    align-self: end;
    grid-area: sep;
    z-index: 1;
  }

  .sticky-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-area: sep;
    grid-template-areas:
        "main main"
        "raw filtered"
        "sep sep";
    position: sticky;
    margin: 0 -8px 12px;
    padding: 5px 8px 0;
    top: -20px;
    align-self: end;
    background: var(--main-background);
  }

  .sticky-spectrum {
    grid-area: main;
    height: 100px;
    border: var(--standard-border);
  }

  .sticky-separator {
    grid-area: sep;
    background-color: var(--main-highlight);
    border-radius: 3px;
    width: auto;
    height: 5px;
    margin: 0 -10px;
    justify-self: stretch;
  }

  .swatch {
    border-radius: 50px;
    margin: 5px 15px;
    text-transform: uppercase;
    text-align: center;
  }

  .raw-swatch {
    grid-area: raw;
  }
  .filtered-swatch {
    grid-area: filtered;
  }
}

</style>
