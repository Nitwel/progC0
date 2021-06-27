<template>
  <div>
      Counter {{modelValue}}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['update:modelValue'],
  props: {
      modelValue: {
          type: Number,
          default: 0
      }
  },
  setup(props, {emit}) {
      
  }
})
</script>

<style>
</style>
