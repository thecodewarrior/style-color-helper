<template>
  <div class="filter-panel">
    <div class="panel-header">
      <div class="icon-button" @click="toggleAddMode">
        <fa style="color: var(--main-highlight);" :icon="addMode ? 'times' : 'plus'"/>
      </div>
      <div v-if="!addMode" class="icon-button" @click="$emit('update:hideFilters', !hideFilters)">
        <fa style="color: var(--main-highlight);" :icon="hideFilters ? 'eye-slash' : 'eye'"/>
      </div>
    </div>

    <div v-show="addMode" class="body-scroll">
      <div class="add-list">
        <template v-for="filter in filterOptions" :key="filter.id">
          <div class="icon-button add-plus" @click="add(filter.id)"><fa style="color: var(--main-highlight);" icon="plus"/></div>
          <div class="add-name">{{filter.name}}</div>
        </template>
      </div>
    </div>
    <div v-show="!addMode" class="body-scroll">
    <draggable
        class="filter-list"
        v-model="model.filters"
        item-key="id"
        handle=".filter-handle"
        animation="150"
    >
      <template #item="{element, index}">
        <div class="filter-item">
          <div class="icon-button filter-handle"><fa style="color: var(--main-highlight);" icon="grip-lines"/></div>
          <div class="icon-button filter-show" @click.stop="toggle(index)">
            <fa style="color: var(--main-highlight);" :icon="element.visible ? 'eye' : 'eye-slash'"/>
          </div>
          <div class="filter-name">{{ element.filter.name }}</div>
          <div class="icon-button filter-remove" @click="removeFilter(index)">
            <fa style="color: var(--main-highlight);" icon="minus-circle"/>
          </div>
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
  addMode: boolean = false

  removeFilter(idx: number) {
    this.model.filters.splice(idx, 1);
  }

  toggle(idx: number) {
    this.model.filters[idx].visible = !this.model.filters[idx].visible
  }

  add(id: string) {
    this.model.filters.push(new ParameterizedFilter(filterRegistry[id]))
    this.addMode = false
  }

  toggleAddMode() {
    this.addMode = !this.addMode
  }

  get filterOptions() {
    return filterTypes.map(value => ({name: value.name, id: value.id}))
  }

}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  width: 300px;

  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 5px 10px;
}

.icon-button {
  font-size: 1.2em;
  width: 1.25em;
  align-self: stretch;
  text-align: center;
  cursor: pointer;
}

.body-scroll {
  width: 310px; /* +10 for scrollbar */
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
      "handle parameters parameters parameters";
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
  align-items: center;
}
</style>