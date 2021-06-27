import { Ref } from "vue";
import { Instruction } from "./instruction";

export class STORE extends Instruction {
    address: number;
  
    constructor(args: string[]) {
        super();
      this.address = Number(args[1]);
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
  
      mainStorage.value[this.address] = stack.value.pop() || 0;
      counter.value += 1;
    }
  
    static matches(line: string) {
        return line.startsWith('STORE ')
    }
  }