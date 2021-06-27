import { Ref } from "vue";

export abstract class Instruction {

    abstract execute(
      counter: Ref<number>,
      stack: Ref<number[]>,
      mainStorage: Ref<number[]>,
      input: Ref<number[]>,
      output: Ref<number[]>
    ): void;
    static matches(line: string) {
        return false 
    }
  }
  