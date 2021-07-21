<template>
  <div class="filter-panel">
    <div class="filter-header">
      <div class="filter-show" @click.stop="$emit('update:hideFilters', !hideFilters)">
        <fa style="color: var(--main-highlight);" :icon="hideFilters ? 'eye-slash' : 'eye'"/>
      </div>
      <button>Add</button>
    </div>
    <draggable
        class="filter-list"
        v-model="model.filters"
        @start="drag=true"
        @end="drag=false"
        item-key="id"
        handle=".filter-handle, .filter-name"
    >
      <template #item="{element, index}">
        <div class="filter-item">
          <fa class="filter-handle" style="color: var(--main-highlight);" icon="grip-lines"/>
          <div class="filter-show" @click.stop="toggle(index)">
            <fa style="color: var(--main-highlight);" :icon="element.visible ? 'eye' : 'eye-slash'"/>
          </div>
          <div class="filter-name">{{ element.filter.name }}</div>
          <fa class="filter-remove" style="color: var(--main-highlight);" icon="minus-circle" @click="removeFilter(index)"/>
          <div class="filter-parameters">
            <template v-for="(_, i) in element.values" :key="i">
              <div class="parameter-name">{{ element.parameters[i].name }}</div>
              <parameter-editor
                  class="parameter-value"
                  :parameter="element.parameters[i]"
                  :value="element.values[i]"
                  @input="element.values[i] = $event"
              />
            </template>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import chroma, {Color} from "chroma-js";
import {PropType} from "vue";
import draggable from "vuedraggable";
import ParameterEditor from "@/components/ParameterEditor.vue";

@Options({
  components: {
    ParameterEditor,
    draggable
  },
  props: {
    model: {type: Object as PropType<Model>, required: true},
    hideFilters: {type: Boolean, default: false},
  },
  emits: [
    'update:hideFilters'
  ]
})
export default class FilterPanel extends Vue {
  model!: Model
  drag: boolean = false

  removeFilter(idx: number) {
    this.model.filters.splice(idx, 1);
  }

  toggle(idx: number) {
    this.model.filters[idx].visible = !this.model.filters[idx].visible
  }

}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
  align-items: start; /* this allows the scrollbar to overflow off the side */
}

.filter-list {
  flex-shrink: 1;
  overflow-y: scroll;
  -webkit-scrollbar-color: var(--main-highlight) transparent;
  -webkit-scrollbar-width: thin;
  scrollbar-color: var(--main-highlight) transparent;
  scrollbar-width: thin;
}

.filter-list > * {
  width: 300px;
  overflow: hidden;
}

.filter-item {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  grid-template-areas:
      "handle show name remove"
      ". parameters parameters parameters";
  align-items: center;
  gap: 5px 10px;
  margin-bottom: 15px;
}

.filter-handle {
  grid-area: handle;
  font-size: 1.2em;
  cursor: grab;
}

.filter-show {
  grid-area: show;
  font-size: 1.2em;
  cursor: pointer;
}

.filter-name {
  grid-area: name;
  font-size: 1.2em;
  cursor: grab;
}

.filter-remove {
  grid-area: remove;
  font-size: 1.2em;
  cursor: pointer;
}

.filter-parameters {
  grid-area: parameters;
  display: grid;
  grid-template-columns: 100px 1fr;
}

.filter-header {
  display: flex;
  flex-direction: row;
}
</style>