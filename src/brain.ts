import { ref, Ref } from "vue";
import { Instruction, VOID } from "./instructions";

export enum Mode {
  AM0 = 'AM0',
  AM1 = 'AM1',
  C0 = 'C0',
  C1 = 'C1'
}

export function machine() {
  const code = ref(`#include <stdio.h>
int main() {
  int i, n, s;
  scanf("%d", &n);
  i = 1;
  s = 0;
  while(i < n ) {
    s = s+i*i;
    i = i+1;
  }
  printf("%d", s);
  return 0;
}`)

const code2 = ref(`#include <stdio.h>
int main() {
  const n = 4;
  int i;
  i = 5;
  i = 1 * 2 + n * i;

  return 0;
}`)

  const running = ref(false);
  const paused = ref(false);
  const finished = ref(false)
  const speed = ref(2);
  const mode = ref<Mode>(Mode.C0)

  const counter: Ref<number> = ref(0);
  const instructions: Ref<Instruction[]> = ref([]);
  const mainStorage: Ref<number[]> = ref([]);
  const input: Ref<number[]> = ref([]);
  const output: Ref<number[]> = ref([]);
  const stack: Ref<number[]> = ref([]);

  let waitIndex = 0
  let maxWaitSpeed = 49

  async function run() {
    paused.value = running.value && !paused.value
    if(paused.value === false && running.value === false && finished.value === true) {
      reset()
    }
    running.value = true
    while (counter.value < instructions.value.length && running.value && paused.value === false) {
      instructions.value[counter.value].execute(
        counter,
        stack,
        mainStorage,
        input,
        output
      );
      waitIndex++;
      console.log(waitIndex % Math.pow(speed.value - maxWaitSpeed, 2))
      if(speed.value <= maxWaitSpeed || waitIndex % (speed.value - maxWaitSpeed) === 0) {
        await new Promise((resolve) => setTimeout(resolve, Math.ceil(1000 / speed.value)));
        waitIndex = 0
      }
    }

    if(paused.value === false) {
      running.value = false
      finished.value = true
    }
  }

  function reset() {
    finished.value = false
    counter.value = 0;
    mainStorage.value = [];
    input.value = [];
    output.value = [];
    stack.value = [];
    running.value = false
  }

  function pause() {
    if(running.value) run()
  }

  function runStep() {
    if (counter.value >= instructions.value.length) {
      finished.value = true
      return
    }
    instructions.value[counter.value].execute(
      counter,
      stack,
      mainStorage,
      input,
      output
    );
    running.value = true
    paused.value = true
  }

  return {
    counter,
    instructions,
    mainStorage,
    input,
    output,
    stack,
    run,
    runStep,
    reset,
    pause,
    running,
    paused,
    speed,
    finished,
    mode,
    code
  };
}