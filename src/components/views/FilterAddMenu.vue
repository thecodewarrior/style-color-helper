<template>
  <div class="filter-panel">
    <div class="body-scroll">
      <div class="add-list">
        <template v-for="filter in addOptions" :key="filter.id">
          <div class="icon-button add-plus" @click="add(filter.id)"><fa icon="plus"/></div>
          <div class="add-name">{{filter.name}}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import {PropType} from "vue";
import draggable from "vuedraggable";
import {filterRegistry, filterMenu} from "@/logic/Filters";
import {ParameterizedFilter} from "@/logic/Filter";
import NumberInput from "@/components/parameter/NumberInput.vue";
import {vec3, vec4} from "@/logic/math/vec";
import chroma, {Color} from "chroma-js";
import ColorPanel from "@/components/ColorPanel.vue";
import SliderInput from "@/components/parameter/SliderInput.vue";
import Tippy from "@/lib/Tippy.vue";
import {Inject, Provide, Watch} from "vue-property-decorator";

type PanelMode = 'filters' | 'add' | 'color' | 'save'

@Options({
  components: {
  },
  props: {
  },
  watch: {
  }
})
export default class FilterAddMenu extends Vue {
  @Inject({from: 'model'})
  model!: Model

  add(id: string) {
    this.model.filters.push(new ParameterizedFilter(filterRegistry[id]))
    this.$router.back()
  }

  get addOptions() {
    return filterMenu.map(id => ({name: filterRegistry[id].name, id}))
  }
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  flex-shrink: 1;
  overflow-y: scroll;
  -webkit-scrollbar-color: var(--standard-scroll-color);
  -webkit-scrollbar-width: var(--standard-scroll-width);
  scrollbar-color: var(--standard-scroll-color);
  scrollbar-width: var(--standard-scroll-width);
}

.body-scroll > * {
  width: 300px;
  overflow: hidden;
}

.add-list {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1.75em;
  gap: 5px 10px;
  align-items: center;
}

.add-name {
  font-size: 1.2em;
}
</style>