import { Ref } from "vue";
import { Instruction } from "./instruction";

export class VOID extends Instruction {
    execute(
      counter: Ref<number>,
      stack: Ref<number[]>,
      mainStorage: Ref<number[]>,
      input: Ref<number[]>,
      output: Ref<number[]>
    ) {
      counter.value += 1;
    }
    static matches(line: string) {
      return line === "" || line.startsWith('#');
    }
  }