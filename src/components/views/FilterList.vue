<template>
  <div class="filter-panel">
    <router-link to="/add" class="icon-button" style="grid-area: add;">
      <fa icon="plus"/>
    </router-link>
    <div class="header-name" style="grid-area: name;">{{model.name}}</div>
    <router-link to="/save" class="icon-button" style="grid-area: eye;">
      <fa icon="folder"/>
    </router-link>
    <div class="body-scroll" style="grid-area: list;">
      <draggable
          v-model="model.filters"
          item-key="id"
          handle=".filter-handle"
          animation="150"
      >
        <template #item="{element, index}">
          <div class="filter-item">
            <div class="icon-button filter-handle"><fa icon="grip-lines"/></div>
            <div class="icon-button filter-show" @click.stop="toggle(index)">
              <fa :icon="element.visible ? 'eye' : 'eye-slash'"/>
            </div>
            <div class="filter-name">{{ element.filter.name }}</div>
            <div class="icon-button filter-remove" @click="removeFilter(index)">
              <fa icon="minus-circle"/>
            </div>
            <div class="filter-parameters">
              <template v-for="(parameter, i) in element.parameters" :key="i">
                <div class="parameter-name">{{ parameter.name }}</div>
                <number-input
                    v-if="parameter.type === 'number'"
                    class="parameter-value"
                    :control="parameter"
                    :value="element.values[i]"
                    @input="element.values[i] = $event"
                />
                <div v-else-if="parameter.type === 'color'" class="parameter-value color-parameter" @click="editColor(index, i)">
                  <div :style="swatchStyle(element.values[i])">
                    {{swatchHex(element.values[i])}}
                  </div>
                </div>
                <slider-input v-else-if="parameter.type === 'slider'" :control="parameter" :value="element.values[i]" @input="element.values[i] = $event"/>
                <div v-else>
                  &lt;&lt;{{parameter.type}}&gt;&gt;
                </div>
              </template>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import draggable from "vuedraggable";
import NumberInput from "@/components/parameter/NumberInput.vue";
import {vec3} from "@/logic/math/vec";
import chroma from "chroma-js";
import ColorPanel from "@/components/ColorPanel.vue";
import SliderInput from "@/components/parameter/SliderInput.vue";
import Tippy from "@/lib/Tippy.vue";
import {Inject} from "vue-property-decorator";

@Options({
  components: {
    Tippy,
    SliderInput,
    ColorPanel,
    NumberInput,
    draggable
  },
  props: {
  },
  watch: {
  }
})
export default class FilterList extends Vue {
  @Inject({from: 'model'})
  model!: Model

  removeFilter(idx: number) {
    this.model.filters.splice(idx, 1);
  }

  toggle(idx: number) {
    this.model.filters[idx].visible = !this.model.filters[idx].visible
  }

  swatchHex(color: vec3): string {
    return chroma.gl(color.r, color.g, color.b).hex()
  }

  private swatchStyle(value: vec3) {
    let color = chroma.gl(value.r, value.g, value.b)
    let whiteContrast = chroma.contrast('white', color)
    let blackContrast = chroma.contrast('black', color)
    return {
      'color': blackContrast > whiteContrast ? 'black' : 'white',
      'background-color': color.hex()
    }
  }

  editColor(filterIndex: number, parameterIndex: number) {
    this.$router.push(`/color/${filterIndex}/${parameterIndex}`)
  }
}
</script>

<style scoped>
.filter-panel {
  display: grid;
  width: 300px;
  grid-template-columns: 1.5em 1.5em 1fr 1.5em 1.5em;
  grid-template-rows: 1.75em 1fr;
  grid-template-areas:
      'add eye name . .'
      'list list list list list';
  align-items: center;
  justify-items: center;
  grid-gap: 5px 10px;
}

.icon-button {
  font-size: 1.2em;
  width: 1.25em;
  text-align: center;
  cursor: pointer;
  color: inherit;
}

.body-scroll {
  width: 315px; /* +15 for scrollbar */
  margin-right: -15px;
  flex-shrink: 1;
  overflow-y: scroll;
  -webkit-scrollbar-color: var(--standard-scroll-color);
  -webkit-scrollbar-width: var(--standard-scroll-width);
  scrollbar-color: var(--standard-scroll-color);
  scrollbar-width: var(--standard-scroll-width);
  align-self: stretch;
}

.body-scroll > * {
  width: 300px;
  overflow: hidden;
}

.filter-item {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  grid-template-areas:
      "handle show name remove"
      "parameters parameters parameters parameters";
  align-items: center;
  gap: 5px 10px;
  margin-bottom: 15px;
  background: var(--main-background);
}

.filter-handle {
  grid-area: handle;
}

.filter-show {
  grid-area: show;
}

.filter-name {
  grid-area: name;
  font-size: 1.2em;
}

.filter-remove {
  grid-area: remove;
}

.filter-parameters {
  grid-area: parameters;
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-auto-rows: 25px;
  align-items: center;
  margin-left: 0.75em;
}

.color-parameter > div {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
}
</style>