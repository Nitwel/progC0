<template>
  <div class="input">
      <div class="input-title">Input</div>
      <div class="blocks">
        <div class="block" v-for="(value, index) in value" :key="index">
          <input type="text" :value="value" @input="updateValue(index, $event.target.value)" size="3" placeholder="..."/>
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
      const value = computed({
        get() {
          const newList = props.modelValue.map(val => String(val))
          newList.push("")
          return newList
        },
        set(newVal: string[]) {
          emit('update:modelValue', newVal.map(val => parseInt(val)).filter(val => !isNaN(val)))
        }
      })
      return {value, updateValue}

      function updateValue(index: number, newValue: string) {
        value.value[index] = newValue
        value.value = value.value
      }
  }
})
</script>

<style scoped>
.input {
  padding: 20px;
}

.input-title {
  font-size: 20px;
  margin-bottom: 10px;
}

.blocks {
  display: flex;
}

.block {
  height: 30px;
  min-width: 30px;
  background-color: var(--primary-color);
  border-radius: 4px;
  margin-right: 10px;
}

.block input {
  height: 100%;
  padding: 0 5px;
  text-align: center;
  background-color: transparent;
  color: white;
}
</style>
