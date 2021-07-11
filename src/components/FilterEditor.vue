<template>
  <div class="filter-editor">
    <div class="filter-name">{{ filter.filter.name }}</div>
    <parameter-editor class="filter-control"
                      v-for="(_, i) in filter.values" :key="i"
                      :parameter="filter.parameters[i]" :value="filter.values[i]" @input="filter.values[i] = $event"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import {PropType} from "vue";
import ParameterEditor from "@/components/ParameterEditor.vue";
import {ParameterizedFilter} from "@/logic/Filter";

@Options({
  components: {ParameterEditor},
  props: {
    filter: {parameter: Object as PropType<ParameterizedFilter>, required: true}
  }
})
export default class FilterEditor extends Vue {
  mounted() {
  }
}
</script>

<style scoped>
.filter-editor {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
