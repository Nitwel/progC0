import { Ref } from "vue";
import { Instruction } from "./instruction";

export class LIT extends Instruction {
    value: number;
  
    constructor(args: string[]) {
        super();
      this.value = Number(args[1]);
    }
  
    execute(
      counter: Ref<number>,
      stack: Ref<number[]>,
      mainStorage: Ref<number[]>,
      input: Ref<number[]>,
      output: Ref<number[]>
    ) {
      stack.value.push(this.value);
      counter.value += 1;
    }
    static matches(line: string) {
        return line.startsWith('LIT ')
    }
  }