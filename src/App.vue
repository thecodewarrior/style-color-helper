<template>
  <div class="app">
    <color-component
        :model="model" component="hue" label="H" :hide-filters="hideFilters"
        style="grid-area: hue; z-index: 10;"
    />
    <color-component
        :model="model" component="saturation" label="S" :hide-filters="hideFilters"
        style="grid-area: sat; z-index: 10;"
    />
    <color-component
        :model="model" component="lightness" label="L" :hide-filters="hideFilters"
        style="grid-area: lit; z-index: 10;"
    />
    <color-picker-spectrum
        class="main-spectrum"
        hue="x" :saturation="model.saturation" lightness="-y"
        v-model:x="model.normalHue" v-model:y="model.lightness"
        :render-width="300" :render-height="100"
        :model="model"
        :hide-filters="hideFilters"
        :border="{radius: 20, width: 5, transition: '0.5s'}"
        style="grid-area: main; z-index: 12;"
    />
    <color-swatch class="small-swatch" style="grid-area: orig; z-index: 8;" :color="model.rawColor"/>
    <color-swatch class="small-swatch" style="grid-area: filt; z-index: 8;" :color="filteredColor"/>
    <color-edit-swatch class="main-swatch" style="grid-area: orig; z-index: 10;" v-model:color="model.rawColor"/>
    <color-swatch class="main-swatch" style="grid-area: filt; z-index: 10;" :color="filteredColor"/>

    <div class="sticky-top-mask" style="z-index: 11;"/> <!-- sticks up above the main spectrum-->
    <div class="sticky-bottom-mask" style="z-index: 5;"/> <!-- covers the space between the spectrum and separator -->
    <div class="panel-separator" style="z-index: 10;"></div>
    <filter-panel class="side-panel" :model="model" v-model:hide-filters="hideFilters"/>
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
import {swatchStyle} from "@/utils";
import ColorComponent from "@/components/ColorComponent.vue";
import ColorEditSwatch from "@/components/ColorEditSwatch.vue";
import ColorSwatch from "@/components/ColorSwatch.vue";

@Options({
  components: {ColorSwatch, ColorEditSwatch, ColorComponent, ColorPickerSpectrum, FilterPanel, ColorPanel},
  props: {}
})
export default class App extends Vue {
  model: Model = new Model()
  hideFilters: boolean = false
  mounted() {
    this.model.addFilter(new ParameterizedFilter(filterRegistry["posterize"])).values[0] = 3
  }

  get filteredColor() {
    return this.hideFilters ? this.model.rawColor : this.model.computedColor
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

  grid-template-rows: 35px 35px 35px 130px 65px;
  grid-template-columns: 150px 15px 150px 30px 300px;
  grid-template-areas:
      "hue  hue  hue  sep side"
      "sat  sat  sat  sep side"
      "lit  lit  lit  sep side"
      "main main main sep side"
      "orig  ..  filt sep side";
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
}

.side-panel {
  grid-area: side;
}

.sticky-bottom-mask, .sticky-top-mask, .small-swatch {
  display: none;
}

.main-spectrum {
  margin-bottom: 10px;
  border: var(--standard-border);
}

.main-swatch {
  padding: 15px 0;
  font-size: 20px;
  border: var(--standard-border);
  border-radius: 20px;
}

@media (max-width: 700px) {
  .app {
    grid-template-rows: 35px 35px 35px 130px 65px 30px auto;
    grid-template-columns: 150px 15px 150px;
    grid-template-areas:
      "hue  hue  hue "
      "sat  sat  sat "
      "lit  lit  lit "
      "main main main"
      "orig  ..  filt"
      "sep  sep  sep "
      "side side side";

    max-height: 100vh;
    overflow-y: scroll;
    -webkit-scrollbar-color: var(--standard-scroll-color);
    -webkit-scrollbar-width: var(--standard-scroll-width);
    scrollbar-color: var(--standard-scroll-color);
    scrollbar-width: var(--standard-scroll-width);
  }


  .main-spectrum {
    position: sticky;
    top: -15px;
  }

  .small-swatch {
    display: block;
    position: sticky;
    top: 110px;
    height: 20px;
    margin: 0 5px;

    align-self: center;
    border-radius: 20px;
  }

  .panel-separator {
    position: sticky;
    top: 135px;
    width: auto;
    height: 5px;
    margin: 12px -10px;

    justify-self: stretch;
    align-self: center;
  }

  .sticky-top-mask {
    display: block;
    position: sticky;
    top: -20px;
    height: 50px;
    background: var(--main-background);
    align-self: end;
    grid-area: main;
  }

  .sticky-bottom-mask {
    display: block;
    position: sticky;
    top: -20px;
    margin: 0 -10px 12px;
    height: 155px;
    background: var(--main-background);
    align-self: end;
    grid-area: sep;
  }
}

</style>
