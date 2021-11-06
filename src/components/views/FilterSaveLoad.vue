<template>
  <div class="save-panel">
    <div class="filter-name" style="grid-area: name;">{{model.name}}</div>
    <div class="save-top-controls" style="grid-area: top;">
      <input type="text" ref="clipboardField" v-tippy:paste :value="model.encoded" @focus="clipboardFieldFocus" @change="loadClipboard($event.target.value)"/>
      <tippy target="paste" trigger="manual" :visible="pasteVisible" placement="top">{{ pasteStatus }}</tippy>
      <div class="icon-button" v-tippy:permalink @click="copyPermalink">
        <fa icon="link"/>
      </div>
      <tippy target="permalink" trigger="manual" :visible="permalinkVisible" placement="left">Copied</tippy>
    </div>
    <div class="body-scroll" style="grid-area: body;">
      <div class="saved-list">
        <template v-for="name in savedNames" :key="name">
          <div class="icon-button" @click="loadSaved(name)"><fa icon="folder-open"/></div>
          <div class="">{{name}}</div>
          <div class="icon-button" @click="deleteSaved(name)"><fa icon="trash-alt"/></div>
        </template>
      </div>
    </div>
    <div class="save-bottom-controls" style="grid-area: bottom;">
      <input type="text" v-model="model.name"/>
      <div class="icon-button" @click="saveLocal">
        <fa icon="save"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import Model from "@/logic/Model";
import Tippy from "@/lib/Tippy.vue";
import {Inject} from "vue-property-decorator";

@Options({
  components: {
    Tippy,
  },
  props: {
  },
  watch: {
  }
})
export default class FilterSaveLoad extends Vue {
  @Inject({from: 'model'})
  model!: Model

  savedNames: string[] = []

  pasteVisible: boolean = false
  pasteTimeout: number = -1
  pasteStatus: string = "Pasted"
  permalinkVisible: boolean = false
  permalinkTimeout: number = -1

  get clipboardField(): HTMLInputElement {
    return this.$refs['clipboardField'] as HTMLInputElement
  }

  mounted() {
    this.loadNames()
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
    this.$router.back()
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
.save-panel {
  display: grid;
  width: 300px;
  grid-template-columns: 1fr;
  grid-template-rows: 1.75em auto 1fr auto;
  grid-template-areas: 'name' 'top' 'body' 'bottom';
  justify-items: stretch;
  align-items: stretch;
  grid-gap: 5px 10px;
}

.icon-button {
  font-size: 1.2em;
  width: 1.25em;
  align-self: stretch;
  text-align: center;
  cursor: pointer;
  color: inherit;
}

.body-scroll {
  width: 315px; /* +15 for scrollbar */
  margin-right: -15px;
  flex-grow: 1;
  flex-shrink: 1;
  overflow-y: scroll;
  -webkit-scrollbar-color: var(--standard-scroll-color);
  -webkit-scrollbar-width: var(--standard-scroll-width);
  scrollbar-color: var(--standard-scroll-color);
  scrollbar-width: var(--standard-scroll-width);
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

.filter-name {
  justify-self: center;
  align-self: center;
}
</style>