<template>
  <div class="main-storage" :class="{animate: speed < 20}">
    <div class="main-storage-title">MainStorage</div>
    <div class="values">
      <div class="slot">
        <div class="value-title">Values:</div>
        <div class="index-title">Index:</div>
      </div>
      <transition name="list" v-for="index in slots" :key="index" mode="out-in">
        <div class="slot" :key="modelValue[index - 1]">
          <div class="value">{{ modelValue[index - 1] }}</div>
          <div class="index">{{ index - 1 }}</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Array as PropType<number[]>,
      default: [],
    },
    speed: {
      type: Number
    }
  },
  setup(props, { emit }) {
    const slots = computed(() => Math.max(props.modelValue.length, 10));

    return { slots };
  },
});
</script>

<style scoped>
.main-storage {
  grid-column: span 2;
  padding: 20px;
}

.main-storage-title {
  font-size: 20px;
  margin-bottom: 10px;
}

.values {
  display: flex;
}

.slot {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-right: 10px;
}

.slot .value {
  min-width: 30px;
  height: 30px;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 4px;
  margin-bottom: 5px;
  padding: 0 5px;
}

.index {
  color: var(--dark-gray);
}

.slot .value-title {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-bottom: 5px;
}

.main-storage.animate .list-enter-active {
  transition: all 100ms;
}
.main-storage.animate .list-leave-active {
  transition: all 100ms;
}
.main-storage.animate .list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.main-storage.animate .list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
