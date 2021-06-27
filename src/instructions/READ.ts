import { Ref } from "vue";
import { Instruction } from "./instruction";

export class READ extends Instruction {
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
      if (input.value.length === 0)
        throw new Error(`Can't read value from input as it is empty.`);
  
      mainStorage.value[this.address] = input.value.shift() || 0
      counter.value += 1;
    }
  
    static matches(line: string) {
        return line.startsWith('READ ')
    }
  }