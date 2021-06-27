import { Ref } from "vue";
import { Instruction } from "./instruction";

enum Type {
  ADD = "ADD",
  SUB = "SUB",
  DIV = "DIV",
  MOD = "MOD",
  MUL = "MUL",
  GE = "GE",
  LT = "LT",
  GT = "GT",
  LE = "LE",
  EQ = "EQ",
  NE = "NE",
}

export class Operand extends Instruction {
  type: Type;

  constructor(args: string[]) {
    super();
    this.type = Object.values(Type).find((type) =>
      args[0].startsWith(type.toString())
    ) as Type;
  }

  execute(
    counter: Ref<number>,
    stack: Ref<number[]>,
    mainStorage: Ref<number[]>,
    input: Ref<number[]>,
    output: Ref<number[]>
  ) {
    if (stack.value.length < 2)
      throw new Error(`Stack needs to have at least 2 values.`);

    const first = stack.value.pop() || 0;
    const second = stack.value.pop() || 0;

    switch(this.type) {
      case Type.ADD: stack.value.push(second + first); break;
      case Type.DIV: stack.value.push(second / first); break;
      case Type.MUL: stack.value.push(second * first); break;
      case Type.MOD: stack.value.push(second % first); break;
      case Type.SUB: stack.value.push(second - first); break;
      case Type.LT: stack.value.push(second < first? 1 : 0); break;
      case Type.LE: stack.value.push(second <= first? 1 : 0); break;
      case Type.GE: stack.value.push(second >= first? 1 : 0); break;
      case Type.GT: stack.value.push(second > first? 1 : 0); break;
      case Type.EQ: stack.value.push(second === first? 1 : 0); break;
      case Type.NE: stack.value.push(second !== first? 1 : 0); break;
    }

    
    counter.value += 1;
  }
  static matches(line: string) {
    const type = Object.keys(Type).find((type) => line === type);
    return type !== undefined;
  }
}
