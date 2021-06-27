import { Ref } from "vue";
import { Instruction } from "./instruction";

export class JMP extends Instruction {
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
        counter.value = this.instructionIndex;
    }
    static matches(line: string) {
        return line.startsWith('JMP ')
    }
  }