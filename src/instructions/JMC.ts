import { Ref } from "vue";
import { Instruction } from "./instruction";

export class JMC extends Instruction {
    instructionIndex: number;
  
    constructor(args: string[]) {
        super();
      this.instructionIndex = Number(args[1]);
    }
  
    execute(
      counter: Ref<number>,
      stack: Ref<number[]>,
      mainStorage: Ref<number[]>,
      input: Ref<number[]>,
      output: Ref<number[]>
    ) {
      if (stack.value.length === 0)
        throw new Error(`Can't remove value from stack as it is empty.`);
  
      if (stack.value.pop() === 0) {
        counter.value = this.instructionIndex;
      } else {
        counter.value += 1;
      }
    }
    static matches(line: string) {
        return line.startsWith('JMC ')
    }
  }