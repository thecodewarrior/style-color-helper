<template>
  <div class="swatch" :style="style">
    #<div class="hex-editor" ref="hexEditor" contenteditable="true" spellcheck="false" @input="hexEditorChanged" @focus="hexEditorFocus" @blur="hexEditorBlur" @keydown="hexEditorKeydown"></div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import ColorPickerSpectrum from "@/components/ColorPickerSpectrum.vue";
import chroma, {Color} from "chroma-js";
import {PropType} from "vue";
import Tippy from "@/lib/Tippy.vue";
import {Watch} from "vue-property-decorator";
import {swatchStyle} from "@/utils";

@Options({
  components: {
    Tippy,
    ColorPickerSpectrum
  },
  props: {
    color: {type: Object as PropType<Color>},
  },
  emits: [
    'update:color'
  ]
})
export default class ColorEditSwatch extends Vue {
  color!: Color
  hexEditorFocused: boolean = false

  get hexEditorRef(): HTMLElement {
    return this.$refs['hexEditor'] as HTMLElement
  }

  get style() {
    return swatchStyle(this.color)
  }

  hexEditorFocus() {
    this.hexEditorFocused = true

    // https://stackoverflow.com/a/3806004
    setTimeout(() => {
      let sel, range;
      if (window.getSelection && document.createRange) {
        range = document.createRange();
        range.selectNodeContents(this.hexEditorRef);
        sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 1);
  }

  hexEditorBlur() {
    this.hexEditorFocused = false
  }

  hexEditorChanged(event: InputEvent) {
    let hex = (event.target as HTMLElement).innerText
    if(chroma.valid(hex)) {
      this.$emit('update:color', chroma(hex))
    }
  }

  hexEditorKeydown(event: KeyboardEvent) {
    if(event.key == "Enter") {
      event.preventDefault()
      this.hexEditorRef.blur()
    }
  }

  @Watch('hexEditorFocused')
  focusChanged() {
    if(!this.hexEditorFocused) {
      this.updateHexEditorText()
    }
  }

  @Watch('color')
  colorChanged() {
    if(!this.hexEditorFocused) {
      this.updateHexEditorText()
    }
  }

  updateHexEditorText() {
    this.hexEditorRef.innerText = this.color.hex().substring(1)
  }

  mounted() {
    this.updateHexEditorText()
  }
}
</script>

<style scoped>
.swatch {
  text-align: center;
  font-family: 'Roboto Mono', sans-serif;
  text-transform: uppercase;
  cursor: text;
}

.hex-editor {
  display: inline-block;
}

</style>