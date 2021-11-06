<template>
  <div class="app">
    <color-component
        component="hue" label="H"
        style="grid-area: hue; z-index: 10;"
    />
    <color-component
        component="saturation" label="S"
        style="grid-area: sat; z-index: 10;"
    />
    <color-component
        component="lightness" label="L"
        style="grid-area: lit; z-index: 10;"
    />
    <color-picker-spectrum
        class="main-spectrum"
        hue="x" :saturation="rootModel.saturation" lightness="-y"
        v-model:x="rootModel.normalHue" v-model:y="rootModel.lightness"
        :render-width="300" :render-height="100"
        :border="{radius: 20, width: 5, transition: '0.5s'}"
        style="grid-area: main; z-index: 12;"
    />
    <color-swatch class="small-swatch" style="grid-area: orig; z-index: 8;" :color="rootModel.rawColor"/>
    <color-swatch class="small-swatch" style="grid-area: filt; z-index: 8;" :color="rootModel.filteredColor"/>
    <color-edit-swatch class="main-swatch" style="grid-area: orig; z-index: 10;" v-model:color="rootModel.rawColor"/>
    <color-swatch class="main-swatch" style="grid-area: filt; z-index: 10;" :color="rootModel.filteredColor"/>

    <div class="sticky-top-mask" style="z-index: 11;"/> <!-- sticks up above the main spectrum-->
    <div class="sticky-bottom-mask" style="z-index: 5;"/> <!-- covers the space between the spectrum and separator -->
    <div class="panel-separator" style="z-index: 7;">
      <div class="separator-line-top" v-if="hasHistory"></div>
      <div v-if="hasHistory" class="back-button" @click="goBack">
        <fa icon="arrow-left"/>
      </div>
      <div class="separator-line"></div>
    </div>
    <router-view class="side-panel"/>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ParameterizedFilter} from "@/logic/Filter";
import {filterRegistry} from "@/logic/Filters";
import Model from "@/logic/Model";
import ColorPanel from "@/components/ColorPanel.vue";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import ColorComponent from "@/components/ColorComponent.vue";
import ColorEditSwatch from "@/components/ColorEditSwatch.vue";
import ColorSwatch from "@/components/ColorSwatch.vue";
import {Provide} from "vue-property-decorator";

@Options({
  components: {ColorSwatch, ColorEditSwatch, ColorComponent, ColorPickerSpectrum, ColorPanel},
  props: {}
})
export default class App extends Vue {
  @Provide('model')
  rootModel: Model = new Model()

  mounted() {
    let shareData = new URL(location.href).searchParams.get('share')
    if (shareData) {
      try {
        this.rootModel.decode(shareData)
        history.replaceState(null, '', '.');
      } catch(e) {
        console.error(e)
      }
    } else {
      this.rootModel.addFilter(new ParameterizedFilter(filterRegistry["posterize"])).values[0] = 3
    }
  }

  get hasHistory() {
    return this.$route.meta.back
  }

  goBack() {
    this.$router.back()
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
  justify-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.separator-line {
  width: 5px;

  background-color: var(--main-highlight);
  border-radius: 3px;

  margin: -10px 0;
  flex-grow: 1;
}

.separator-line-top {
  width: 5px;
  height: 10px;

  background-color: var(--main-highlight);
  border-radius: 3px;

  margin-top: -10px;
}

.back-button {
  font-size: 1.2em;
  width: 1.25em;
  text-align: center;
  cursor: pointer;
  margin-bottom: 10px;
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
    pointer-events: none;
  }

  .panel-separator {
    position: sticky;
    top: 123px;
    width: auto;

    justify-self: stretch;
    align-self: stretch;

    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .separator-line {
    width: auto;
    height: 5px;
    margin: 0 -10px;
  }

  .separator-line-top {
    width: 8px;
    height: 5px;

    background-color: var(--main-highlight);
    border-radius: 3px;

    margin: 0 2px 0 -10px;
  }

  .back-button {
    cursor: pointer;
    margin-bottom: 0;
    margin-right: 12px;
    background: var(--main-background);
    border-radius: 99px;
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
    height: 160px;
    background: var(--main-background);
    align-self: end;
    grid-area: sep;
  }
}

</style>
