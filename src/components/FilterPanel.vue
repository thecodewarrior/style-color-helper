<template>
  <div class="filter-panel">
    <div v-show="mode === 'filters'" class="panel-mode">
      <div class="panel-header">
        <div class="icon-button" @click="mode = 'add'">
          <fa icon="plus"/>
        </div>
        <div class="icon-button" @click="$emit('update:hideFilters', !hideFilters)">
          <fa :icon="hideFilters ? 'eye-slash' : 'eye'"/>
        </div>
      </div>
      <div class="body-scroll">
        <draggable
            class="filter-list"
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
                  <div v-else-if="parameter.type === 'color'" class="parameter-value color-parameter" @click="editColor(element, i)">
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

    <div v-show="mode === 'add'" class="panel-mode">
      <div class="panel-header">
        <div class="icon-button" @click="mode = 'filters'">
          <fa icon="times"/>
        </div>
      </div>
      <div class="body-scroll">
        <div class="add-list">
          <template v-for="filter in addOptions" :key="filter.id">
            <div class="icon-button add-plus" @click="add(filter.id)"><fa icon="plus"/></div>
            <div class="add-name">{{filter.name}}</div>
          </template>
        </div>
      </div>
    </div>

    <div v-show="mode === 'color'" class="color-mode">
      <div class="color-header">
        <div class="icon-button" @click="closeColor">
          <fa icon="arrow-left"/>
        </div>
      </div>
      <color-panel class="color-picker" :model="subModel" :hide-filters="true"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import {PropType} from "vue";
import draggable from "vuedraggable";
import ParameterEditor from "@/components/parameter/ParameterEditor.vue";
import {filterRegistry, filterTypes} from "@/logic/Filters";
import {ParameterizedFilter} from "@/logic/Filter";
import NumberInput from "@/components/parameter/NumberInput.vue";
import {vec3, vec4} from "@/logic/math/vec";
import chroma, {Color} from "chroma-js";
import ColorPanel from "@/components/ColorPanel.vue";
import SliderInput from "@/components/parameter/SliderInput.vue";

type PanelMode = 'filters' | 'add' | 'color'

@Options({
  components: {
    SliderInput,
    ColorPanel,
    NumberInput,
    ParameterEditor,
    draggable
  },
  props: {
    model: {type: Object as PropType<Model>, required: true},
    hideFilters: {type: Boolean, default: false},
  },
  emits: [
    'update:hideFilters'
  ],
  watch: {
    'subModel.rawColor': 'subColorChanged'
  }
})
export default class FilterPanel extends Vue {
  model!: Model
  mode: PanelMode = 'filters'
  subModel: Model = new Model()
  colorParameter: [ParameterizedFilter, number] | null = null

  removeFilter(idx: number) {
    this.model.filters.splice(idx, 1);
  }

  toggle(idx: number) {
    this.model.filters[idx].visible = !this.model.filters[idx].visible
  }

  add(id: string) {
    this.model.filters.push(new ParameterizedFilter(filterRegistry[id]))
    this.mode = 'filters'
  }

  editColor(filter: ParameterizedFilter, index: number) {
    let rgb = filter.values[index] as vec3
    this.subModel.rawColor = chroma.gl(rgb.r, rgb.g, rgb.b)
    this.colorParameter = [filter, index]
    this.mode = 'color'
  }
  closeColor() {
    this.colorParameter = null
    this.mode = 'filters'
  }
  subColorChanged() {
    if(this.colorParameter) {
      let [filter, index] = this.colorParameter
      filter.values[index] = new vec4(this.subModel.rawColor.gl()).rgb
    }
  }

  get addOptions() {
    return filterTypes.map(value => ({name: value.name, id: value.id}))
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
}
</script>

<style scoped>
.filter-panel {
}

.panel-mode {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.panel-header {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  align-self: start;
  gap: 10px;
}

.color-mode {
  display: grid;
  grid-template-columns: auto 1fr;
  justify-items: stretch;
  align-items: stretch;
  width: 100%;
  height: 100%;
}
.color-header {
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  align-self: start;
  gap: 10px;
}

.icon-button {
  font-size: 1.2em;
  width: 1.25em;
  align-self: stretch;
  text-align: center;
  cursor: pointer;
}

.body-scroll {
  width: 315px; /* +15 for scrollbar */
  flex-shrink: 1;
  overflow-y: scroll;
  -webkit-scrollbar-color: var(--main-highlight) transparent;
  -webkit-scrollbar-width: thin;
  scrollbar-color: var(--main-highlight) transparent;
  scrollbar-width: thin;
}

.body-scroll > * {
  width: 300px;
  overflow: hidden;
}

.add-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px 10px;
  align-items: center;
}

.add-name {
  font-size: 1.2em;
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
  grid-template-rows: 25px;
  align-items: center;
  margin-left: 0.75em;
}
</style>