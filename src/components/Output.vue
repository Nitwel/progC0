<template>
  <div class="output">
      <div class="output-title">Output</div>
      <div class="blocks">
        <div class="block" v-for="(value, index) in modelValue" :key="index">
          {{value}}
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'

export default defineComponent({
  emits: ['update:modelValue'],
  props: {
      modelValue: {
          type: Array as PropType<number[]>,
          default: []
      }
  },
  setup(props, {emit}) {
      
  }
})
</script>

<style scoped>
.output {
  padding: 20px;
}

.output-title {
  font-size: 20px;
  margin-bottom: 10px;
}

.blocks {
  display: flex;
  flex-wrap: wrap;
}

.block {
  height: 30px;
  min-width: 30px;
  background-color: var(--primary-color);
  border-radius: 4px;
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 0 5px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
