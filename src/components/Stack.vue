<template>
  <div class="stack" :class="{animate: speed < 10}">
    <div class="stack-title">Stack</div>
    <transition-group name="stack" class="values" tag="div">
      <div class="slot" v-for="(value, index) in modelValue" :key="index" >
        {{ value }}
      </div>
    </transition-group>
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
.stack {
  grid-column: span 1;
  grid-row: span 2;
  padding: 20px;
}

.stack-title {
  font-size: 20px;
  margin-bottom: 10px;
}

.values {
  display: inline-flex;
  flex-direction: column-reverse;
  position: relative;
}

.slot {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: var(--primary-color);
  border-radius: 4px;
  color: white;
  height: 30px;
  min-width: 30px;
  padding: 0 5px;
  margin-bottom: 10px;
}


.stack.animate .stack-move {
  transition: transform 200ms;
}
.stack.animate .stack-enter-active {
  transition: all 200ms;
}
.stack.animate .stack-leave-active {
  transition: all 200ms;
  position: absolute;
}
.stack.animate .stack-enter-from, .stack.animate .stack-leave-to {
  opacity: 0;
  transform: translateY(-60px);
}
</style>
