<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      Color picker:
      <color-picker></color-picker>
    </p>
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
