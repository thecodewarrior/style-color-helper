<template>
  <div class="filter-panel">
    <div v-show="mode === 'filters'" class="panel-mode">
      <div class="panel-header">
        <div class="icon-button" style="grid-area: L1;" @click="mode = 'add'">
          <fa icon="plus"/>
        </div>
        <div class="icon-button" style="grid-area: L2;" @click="model.hideFilters = !model.hideFilters">
          <fa :icon="model.hideFilters ? 'eye-slash' : 'eye'"/>
        </div>
        <div class="name" style="grid-area: name;">{{model.name}}</div>
        <div class="icon-button" style="grid-area: R1;" @click="mode = 'save'">
          <fa icon="folder"/>
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
        <div class="icon-button" style="grid-area: L1;" @click="mode = 'filters'">
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
        <div class="icon-button" style="grid-area: L1;" @click="closeColor">
          <fa icon="arrow-left"/>
        </div>
      </div>
      <color-panel class="color-picker"/>
    </div>

    <div v-show="mode === 'save'" class="panel-mode save-panel">
      <div class="panel-header">
        <div class="icon-button" style="grid-area: R1;" @click="mode = 'filters'">
          <fa icon="times"/>
        </div>
        <div class="name" style="grid-area: name;">{{model.name}}</div>
      </div>
      <div class="save-top-controls">
        <input type="text" ref="clipboardField" v-tippy:paste :value="model.encoded" @focus="clipboardFieldFocus" @change="loadClipboard($event.target.value)"/>
        <tippy target="paste" trigger="manual" :visible="pasteVisible" placement="top">{{ pasteStatus }}</tippy>
        <div class="icon-button" v-tippy:permalink @click="copyPermalink">
          <fa icon="link"/>
        </div>
        <tippy target="permalink" trigger="manual" :visible="permalinkVisible" placement="left">Copied</tippy>
      </div>
      <div class="body-scroll">
        <div class="saved-list">
          <template v-for="name in savedNames" :key="name">
            <div class="icon-button" @click="loadSaved(name)"><fa icon="folder-open"/></div>
            <div class="">{{name}}</div>
            <div class="icon-button" @click="deleteSaved(name)"><fa icon="trash-alt"/></div>
          </template>
        </div>
      </div>
      <div class="save-bottom-controls">
        <input type="text" v-model="model.name"/>
        <div class="icon-button" @click="saveLocal">
          <fa icon="save"/>
        </div>
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
    Tippy,
    SliderInput,
    ColorPanel,
    NumberInput,
    draggable
  },
  props: {
  },
  watch: {
    'subModel.rawColor': 'subColorChanged'
  }
})
export default class FilterPanel extends Vue {
  @Inject('model')
  model!: Model

  @Provide('model')
  subModel: Model = new Model()

  mode: PanelMode = 'filters'
  colorParameter: [ParameterizedFilter, number] | null = null
  savedNames: string[] = []

  pasteVisible: boolean = false
  pasteTimeout: number = -1
  pasteStatus: string = "Pasted"
  permalinkVisible: boolean = false
  permalinkTimeout: number = -1

  get clipboardField(): HTMLInputElement {
    return this.$refs['clipboardField'] as HTMLInputElement
  }

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
    return filterMenu.map(id => ({name: filterRegistry[id].name, id}))
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

  @Watch('mode')
  modeChanged() {
    if(this.mode === 'save') {
      this.loadNames()
    }
  }

  clipboardFieldFocus() {
    this.clipboardField.setSelectionRange(0, this.clipboardField.value.length)
  }

  loadClipboard(text: string) {
    let success = this.model.decode(text)
    this.pasteStatus = success ? 'Loaded' : 'Invalid'
    this.pasteVisible = true
    clearTimeout(this.pasteTimeout)
    this.pasteTimeout = setTimeout(() => {
      this.pasteVisible = false
    }, 2000)
  }

  loadSaved(name: string) {
    let local = JSON.parse(localStorage.getItem("saved") ?? "{}")
    this.model.decode(local[name])
    if(local[name].startsWith('{'))
      this.saveLocal()
    this.mode = 'filters'
  }

  deleteSaved(name: string) {
    let local = JSON.parse(localStorage.getItem("saved") ?? "{}")
    delete local[name]
    localStorage.setItem("saved", JSON.stringify(local))
    this.loadNames()
  }

  loadNames() {
    let json = JSON.parse(localStorage.getItem("saved") ?? "{}")
    this.savedNames = Object.keys(json).sort()
  }

  saveLocal() {
    let local = JSON.parse(localStorage.getItem("saved") ?? "{}")
    local[this.model.name] = this.model.encoded
    localStorage.setItem("saved", JSON.stringify(local))
    this.loadNames()
  }

  copyPermalink() {
    let url = new URL(location.href)
    // I directly set the search here because searchParams' escaping is overzealous
    url.search = '?share=' + encodeURI(this.model.encoded)
    navigator.clipboard.writeText(url.href).then(() => {
      this.permalinkVisible = true
      clearTimeout(this.permalinkTimeout)
      this.permalinkTimeout = setTimeout(() => {
        this.permalinkVisible = false
      }, 750)
    })
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
  width: 300px;
  grid-template-columns: 1.5em 1.5em 1fr 1.5em 1.5em;
  grid-template-areas: 'L1 L2 name R2 R1';
  align-items: center;
  justify-items: center;
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
  align-self: start;
  justify-self: start;
}
@media (max-width: 700px) {
  .color-mode {
    grid-template-columns: 1fr;
    grid-template-rows: auto 300px;
    width: 315px;
  }
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
  grid-auto-rows: 25px;
  align-items: center;
  margin-left: 0.75em;
}

.color-parameter > div {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
}

.save-panel {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr auto;
}

.save-top-controls, .save-bottom-controls {
  display: grid;
  width: 300px;
  grid-template-columns: 1fr 1.5em;
  grid-gap: 10px;
}

input[type="text"] {
  font: inherit;
  color: inherit;
  background: var(--alt-background);
  border: 2px solid var(--main-border);
  box-sizing: border-box;
}

.saved-list {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 5px 10px;
  align-items: center;
  margin: 10px 0;
}
</style>