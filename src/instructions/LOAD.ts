import { Ref } from "vue";
import { Instruction } from "./instruction";

export class LOAD extends Instruction {
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
      if (this.address in mainStorage.value === false)
        throw new Error(
          `Address ${this.address} does not exist in main storage.`
        );
  
      stack.value.push(mainStorage.value[this.address]);
      counter.value += 1;
    }
    static matches(line: string) {
        return line.startsWith('LOAD ')
    }
  }