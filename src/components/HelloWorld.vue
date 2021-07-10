<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div class="area">
      Color picker:
      <color-picker></color-picker>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import ColorPicker from "@/components/ColorPicker.vue";

@Options({
  components: {ColorPicker},
  props: {
    msg: String
  }
})
export default class HelloWorld extends Vue {
  msg!: string
}
</script>

<style scoped>
.area {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
