<template>
  <div class="compiler" :class="{error}">
    <div class="compiler-title">Compiler</div>
    <div>
        <span v-for="(state, index) in displayStates" :key="index">{{state}}<br/></span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { compiler } from "../compiler";

export default defineComponent({
  emits: [],
  props: {
    displayStates: {
      type: Array as PropType<string[]>,
      default: [],
    },
    error: {
      type: Boolean
    }
  },
  setup(props, { emit }) {
  },
});
</script>

<style scoped>
.compiler {
  grid-column: span 2;
  grid-row: span 2;
  padding: 20px;
}

.compiler.error {
    border: 5px solid red;
}

.compiler-title {
  font-size: 20px;
  margin-bottom: 10px;
}

.text {
    white-space: pre-wrap;
}
</style>
