<template>
  <div class="code" :class="{ running }">
    <div class="textarea-background" :style="{ height }">
      <div
        class="line"
        v-for="i in textLines.length"
        :key="i"
        @click="toggleLineBreak(i - 1)"
        :class="{ error: errorLines.has(i - 1) }"
      >
        <span>{{ i - 1 }}</span>
        <span
          class="line-info material-icons"
          :class="{
            active: i - 1 === counter,
            breakpoint: lineBreaks.has(i - 1),
          }"
          >{{ lineBreaks.has(i - 1) ? "fiber_manual_record" : "forward" }}</span
        >
      </div>
    </div>
    <textarea class="textarea" v-model="text" :style="{ height }"></textarea>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import {
  LOAD,
  JMC,
  STORE,
  Operand,
  LIT,
  Instruction,
  VOID,
  WRITE,
  READ,
  JMP,
} from "../instructions";
import Input from "./Input.vue";

export default defineComponent({
  components: { Input },
  emits: ["update:modelValue", "pause", "update:code"],
  props: {
    modelValue: {
      type: Array as PropType<Instruction[]>,
      default: [],
    },
    counter: {
      type: Number,
      default: 0,
    },
    running: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const text = ref(`LIT 0
STORE 0
LOAD 0
WRITE 0
LIT 1
ADD
STORE 0
LIT 0
JMC 2`)

    const textLines = computed(() => text.value.split("\n"));
    const lineBreaks = ref<Set<number>>(new Set());

    const errorLines = ref<Set<number>>(new Set());

    watch(text, (newValue: string) => {
        errorLines.value.clear();
        const lines = newValue.split("\n").map((l) => l.trim());
        const instructions = lines.map(parseInstruction);
        emit("update:modelValue", instructions);
      },
      { immediate: true }
    );

    watch(() => props.counter, (newPointer) => {
        if (lineBreaks.value.has(newPointer)) emit("pause");
      }
    );

    const height = computed(() => `${textLines.value.length * 20 + 20}px`);

    return { textLines, text, height, toggleLineBreak, lineBreaks, errorLines };

    function toggleLineBreak(line: number) {
      if (lineBreaks.value.has(line)) lineBreaks.value.delete(line);
      else lineBreaks.value.add(line);
    }

    function parseInstruction(
      instruction: string,
      index: number
    ): Instruction | undefined {
      const instructions = [STORE,JMC,LOAD,LIT,Operand,VOID,JMP,READ,WRITE];
      const args = instruction.split(" ");
      for (let x of instructions) {
        if (x.matches(instruction)) return new x(args);
      }
      errorLines.value.add(index);
      return new VOID();
    }
  },
});
</script>

<style>
.code {
  grid-column: span 2;
  grid-row: span 3;
  display: flex;
  overflow: auto;
  background-color: var(--light-gray);
}

.textarea-background {
  width: 50px;
  min-height: 100%;
  padding: 10px 5px 0px 5px;
  background-color: var(--gray);
  color: var(--dark-gray);
  font-family: "Roboto Mono", monospace;
}

.line {
  user-select: none;
  height: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row-reverse;
  cursor: pointer;
}

.line.error {
  color: rgb(207, 34, 34);
}

.line-info {
  display: none;
}

.line-info.breakpoint {
  display: inline-block;
  color: var(--dark-gray);
}

.line-info.active.breakpoint {
  color: rgb(207, 34, 34);
}

.code .textarea-background .line .line-info.active {
  display: inline-block;
  color: rgb(207, 34, 34);
}

textarea {
  flex-grow: 1;
  min-height: 99%;
  resize: none;
  outline: none;
  border: none;
  line-height: 20px;
  padding: 10px;
  background-color: transparent;
  font-family: "Roboto Mono", monospace;
}
</style>
