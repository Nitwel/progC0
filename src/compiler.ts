import { computed, Ref, ref, watch } from 'vue';
import {sequenceOf, str, endOfInput, startOfInput, possibly, digits, letters, many, char, optionalWhitespace, whitespace, coroutine, choice, many1, recursiveParser, between, getData, tapParser, ParserState, Parser, updateResult} from './arcsecond';

export type CompileElement = string | {
    text: string,
    next?: (() => CompileElement)[]
}

export type Tab = Record<string, ['const' | 'var', number]>

export function compiler(code: Ref<string>, speed: Ref<number>) {
    const tab = ref<Tab>({})
    const running = ref(false)
    const paused = ref(false)
    const finished = computed(() => nextCompilers.value.length !== 0 && nextCompilers.value.every((s) => typeof s === 'string'))
    const error = ref(false)

    const nextCompilers = ref<CompileElement[]>([])
    let codeWhenRunning = ""

    const displayStates = computed(() => {
        
        return nextCompilers.value.map(comp => typeof comp === "string" ? comp : comp.text)
    })

    function reset() {
        running.value = false
        paused.value = false
        tab.value = {}
        codeWhenRunning = ""
        parseCode(code.value)
    }

    function pause() {
        if(running.value) run()
    }

    async function run() {
        paused.value = running.value && !paused.value
        if(paused.value === false && running.value === false) {
        reset()
        }
        running.value = true
        while (finished.value === false && running.value && paused.value === false) {
        runStep()
        await new Promise((resolve) => setTimeout(resolve, 1000 / speed.value));
        }

        if(paused.value === false) {
        running.value = false
        }
    }

    function runStep() {
        if(finished.value) {
            replaceLineNumbers()
            return;
        }

        let newCompilers = nextCompilers.value.reduce((newList, compiler) => {
            if(typeof compiler !== "string") return [...newList, ...compiler.next?.map(n => typeof n === "string"? n : n()) || []]
            else return [...newList, compiler]
        }, [] as CompileElement[])
        nextCompilers.value = newCompilers

    }

    function parseCode(newCode: string) {
        if(running.value === false) {
            codeWhenRunning = newCode.replaceAll("\n", " ").trim()
            let result = program.run(codeWhenRunning);
            //console.log(JSON.stringify(result, null, 2))
            if(result.isError === false) nextCompilers.value = [trans(result.result)]
            if(result.isError) {
                console.error(result.error)
            }
            error.value = result.isError
        }
    }

    function replaceLineNumbers() {
        if(finished.value === false) return
        const indexMap = {}
        const newCode = []
        let codeIndex = 0
        for(let i = 0; i < nextCompilers.value.length; i++) {
            const val = nextCompilers.value[i] as string
            const match = /^\d(.\d)*?$/.exec(val)
            if(match === null) {
                newCode.push(val)
                codeIndex++;
            } else {
                indexMap[val] = codeIndex
            }
        }
        nextCompilers.value = newCode.map((c) => {
            const index = Object.keys(indexMap).find(index => c.includes(index))
            if(index === undefined) return c
            return c.replace(index, indexMap[index])
        })
    }

    type Size = {start: number, end: number}
    const lineIndex = new Parser(function tapParser$state(state) {
        return updateResult(state, state.index);
      });

    type Relation = '>' | '<' | '==' | '!=' | '>=' | '<='
    const relation = coroutine(function* () {
        return yield choice([
            char('>'),
            char('<'),
            str('=='),
            str('>='),
            str('!='),
            str('<=')
        ])
    })

    type BooleanExpression = {type: 'booleanExpression', first: SimpleExpression, second: SimpleExpression, relation: Relation} & Size
    const boolExpression = coroutine(function* () {
        const start = yield lineIndex
        const firstExpression = yield simpleExpression
        yield optionalWhitespace
        const rel = yield relation
        yield optionalWhitespace
        const secondExpression = yield simpleExpression
        const end = yield lineIndex
        return {
            type: 'booleanExpression',
            first: firstExpression,
            relation: rel,
            second: secondExpression,
            start,
            end
        }
    })

    type Factor = string | number | SimpleExpression
    const factor = coroutine(function* () {
        return yield recursiveParser(() => choice([
            ident,
            digits.map((x) => Number(x)),
            coroutine(function* () {
                yield char('(')
                yield optionalWhitespace
                const expression = yield simpleExpression
                yield optionalWhitespace
                yield char(')')
                return expression
            })
        ]))
    })
    
    type Operand = '*' | '/' | '%'
    const operand = choice([
        char('*'),
        char('/'),
        char('%')
    ])

    type Term = (Factor | {operand: Operand, factor: Factor})[]
    const term = coroutine(function* () {
        const firstFactor = yield factor
        const factorList: {operand: '*' | '/' | '%', factor: any}[] = yield many(coroutine(function* () {
            yield optionalWhitespace
            const operandResult = yield operand
            yield optionalWhitespace
            const anyFactor = yield factor

            return {operand: operandResult, factor: anyFactor}
        }))
        return [firstFactor, ...factorList]
    })

    const isNegativeSign = coroutine(function* () {
        const signMatch = yield choice([
            char('+'),
            char('-')
        ])
        return signMatch === '-'
    })

    type SimpleExpression = {type: 'simpleExpression', result: {isNegative: boolean, term: Term}[]} & Size
    const simpleExpression = coroutine(function* () {
        const start = yield lineIndex
        const isNegative = (yield possibly(isNegativeSign)) || false
        const firstTerm = yield term
        yield optionalWhitespace
        const termList: {isNegative: boolean, term: any}[] = yield many(coroutine(function* () {
            yield optionalWhitespace
            const isNegative = yield isNegativeSign
            yield optionalWhitespace
            const anyTerm = yield term

            return {isNegative, term: anyTerm}
        }))
        const end = yield lineIndex

        return {type: 'simpleExpression', start, end, result: [{isNegative, term: firstTerm}, ...termList]}
    })

    const ident = coroutine(function* () {
        const varName: string = yield letters
        return varName
    })

    const compStatement = coroutine(function* () {
        yield str("{")
        yield optionalWhitespace
        const statements = yield statementSequence
        yield optionalWhitespace
        yield str("}")
        return statements
    })

    type PrintF = {type: 'output', target: string}
    const printf = coroutine(function* () {
        yield str("printf(\"%d\",")
        yield optionalWhitespace
        const varName = yield ident
        yield optionalWhitespace
        yield char(')')
        yield optionalWhitespace
        yield char(';')

        return {type: 'output', target: varName}
    })

    type ScanF = {type: 'input', target: string}
    const scanf = coroutine(function* () {
        yield str("scanf(\"%d\", ")
        yield optionalWhitespace
        yield str("&")
        const varName = yield ident
        yield optionalWhitespace
        yield str(");")

        return {type: 'input', target: varName}
    })

    type While = {type: 'while', booleanExpression: BooleanExpression, statement: Statement}
    const whileStatement = coroutine(function* () {
        yield str("while")
        yield optionalWhitespace
        yield char('(')
        yield optionalWhitespace
        const bool = yield boolExpression
        yield optionalWhitespace
        yield str(")")
        yield optionalWhitespace
        const statementVal = yield statement

        return {type: 'while',booleanExpression: bool, statement: statementVal}
    })

    type If = {type: 'if', booleanExpression: BooleanExpression, ifStatement: Statement, elseStatement: Statement}
    const ifStatement = coroutine(function* () {
        yield str("if")
        yield optionalWhitespace
        yield char('(')
        yield optionalWhitespace
        const boolValue = yield boolExpression
        yield optionalWhitespace
        yield char(')')
        yield optionalWhitespace
        const ifStatement = yield statement
        yield optionalWhitespace
        const elseStatement = yield possibly(coroutine(function* () {
            yield str("else")
            yield optionalWhitespace
            const elseStatement = yield statement
            return elseStatement
        }))
        return {type: 'if', booleanExpression: boolValue, ifStatement, elseStatement}
    })

    type Assignment = {type: 'assignment', target: string, expression: SimpleExpression}
    const assignment = coroutine(function* () {
        const varName: string = yield ident
        yield optionalWhitespace
        yield str("=")
        yield optionalWhitespace
        const expression: string = yield simpleExpression
        yield optionalWhitespace
        yield char(';')

        //if(varName in tab.value === false) console.error(`variable ${varName} doesn't exist.`)//throw new Error(`variable ${varName} doesn't exist.`)

        return {type: "assignment",target: varName, expression}
    })

    type Statement = (Assignment | If | While | PrintF | ScanF | StatementSequence) & Size
    const statement = coroutine(function* () {
        const start = yield lineIndex
        const statement = yield recursiveParser(() => choice([
            assignment, ifStatement, whileStatement, scanf, printf, compStatement
        ]))
        const end = yield lineIndex

        return {start, end, ...statement}
    })

    type StatementSequence = {type: 'statementSequence', statements: Statement[]} & Size
    const statementSequence = coroutine(function* () {
        const start = yield lineIndex
        const statements = yield many1(coroutine(function* () {
            yield optionalWhitespace
            const statementResult = yield statement
            yield optionalWhitespace
            return statementResult
        }))
        const end = yield lineIndex
        return {type: 'statementSequence', statements, start, end}
    })

    const constDeclaration = coroutine(function* () {
        yield str("const ")
        const name = String(yield letters)
        yield optionalWhitespace
        yield str("=")
        yield optionalWhitespace
        const val = Number(yield digits)
        const otherConstants = (yield many(coroutine(function* () {
            yield optionalWhitespace
            yield char(',')
            yield optionalWhitespace
            const name = String(yield letters)
            yield optionalWhitespace
            yield str("=")
            yield optionalWhitespace
            const val = Number(yield digits)

            return {name, val}
        }))) as unknown as {name: string, val: number}[]
        yield char(";")

        const vars = {[name]: val}
        otherConstants.forEach(({name, val}) => {
            vars[name] = val;
        })

        return vars
    })

    const varDeclaration = coroutine(function* () {
        yield str("int ")
        const varName = String(yield letters)
        
        const varNames = (yield many(coroutine(function* () {
            yield optionalWhitespace
            yield char(',')
            yield optionalWhitespace
            const varName = String(yield letters)
            return varName
        }))) as string[]
        yield char(";")

        return [varName, ...varNames]
    })

    type Declaration = {type: 'declaration', constants: Record<string, number>, variables: string[]} & Size
    const declaration = coroutine(function* () {
        const start = yield lineIndex
        const constants: Record<string, number> = yield possibly(constDeclaration)
        yield optionalWhitespace
        const variables: string[] = yield possibly(varDeclaration)
        const end = yield lineIndex

        return {type: 'declaration', constants, variables, start, end}
    })

    type Block = {type:"block", declarations: Declaration, statements: StatementSequence} & Size
    const block = coroutine(function* () {
        yield optionalWhitespace
        const start = yield lineIndex
        yield char("{")
        yield optionalWhitespace
        const declarations = yield declaration
        yield optionalWhitespace
        const statements = yield statementSequence
        yield optionalWhitespace
        yield str("return 0;")
        yield optionalWhitespace
        yield char("}")
        const end = yield lineIndex 

        
        return {type:"block" ,declarations, statements, start, end}
    })
    type Program = {type: 'program', block: Block} & Size
    const program = coroutine(function* () {
        yield startOfInput
        const start = yield lineIndex
        yield str("#include <stdio.h> int main()")
        const blockResult = yield block
        const end = yield lineIndex
        yield endOfInput

        return {type: 'program', block: blockResult, start, end} as Program
    })

    watch(code, parseCode, {immediate: true})

    return {tab, program, run, runStep, displayStates, nextCompilers, reset, finished, error, running, paused, pause}

    function getText(start: number, end: number) {
        return `"${codeWhenRunning.substr(start, end - start)}"`
    }

    function trans(data: Program): CompileElement {
        return {
            text: `trans(${getText(data.start, data.end)})`,
            next: [blocktrans(data.block)]
        }
    }

    function blocktrans(data: Block): () => CompileElement {
        return () => {

            return {
                text: `blocktrans(${getText(data.start, data.end)})`,
                next: [stseqtrans(data.statements, "1", data.declarations)]
            }
        }
    }

    function update(data: Declaration) {
        tab.value = {}
        const constants = data.constants
        const variables = data.variables

        for(let constant in constants) {
            tab.value[constant] = ['const', constants[constant]]
        }
        let index = 0
        for(let varName of variables) {
            tab.value[varName] = ['var', index]
            index++;
        }
    }

    function stseqtrans(statements: StatementSequence, index: string, declarations?: Declaration): () => CompileElement {
        return () => {
            const next = statements.statements.map((statement, i) => sttrans(statement, index + "." + (i + 1)))
            let updateStr = 'tab'
            if(declarations) {
                updateStr = `update(${getText(declarations.start, declarations.end)}, tab)`
                update(declarations)
            }

            return {
                text: `stseqtrans(${getText(statements.start, statements.end)}, ${updateStr}, ${index})`,
                next
            }
        }
    }

    function sttrans(data: Statement, index: string): () => CompileElement {
        return () => {
            let next = []
            if(data.type === 'input') {
                next = [`READ ${tab.value[data.target][1]}`]
            } else if(data.type === 'output') {
                next = [`WRITE ${tab.value[data.target][1]}`]
            } else if (data.type === 'assignment') {
                next = [simpleexptrans(data.expression), `STORE ${tab.value[data.target][1]}`]
            } else if (data.type === 'if') {
                if(data.elseStatement !== null) {
                    next = [boolexptrans(data.booleanExpression), () => `JMC ${index}.1`, sttrans(data.ifStatement, index + '.2'), () => `JMP ${index}.3`, () => `${index}.1`, sttrans(data.elseStatement, index + '.4'), () => `${index}.3`]
                } else {
                    next = [boolexptrans(data.booleanExpression), () => `JMC ${index}.1`, sttrans(data.ifStatement, index + '.2'),  () => `${index}.1`]
                }
                
            } else if (data.type === 'while') {
                next = [() => index + '.1', boolexptrans(data.booleanExpression), () => `JMC ${index}.2`, sttrans(data.statement, index + '.3') ,() => `JMP ${index}.1` ,() => index + '.2']
            } else if(data.type === 'statementSequence') {
                next = [stseqtrans(data, index)]
            }

            return {
                text: `sttrans(${getText(data.start, data.end)}, tab, ${index})`,
                next
            }
        }
    }

    function boolexptrans(data: BooleanExpression): () => CompileElement {
        return () => {
            const relationMap = {'==': 'EQ', '!=': 'NE', '>': 'GT', '<': 'LT', '>=': 'GE', '<=': 'LE'}
            let next = [simpleexptrans(data.first), simpleexptrans(data.second), () => relationMap[data.relation]]

            return {
                text: `boolexptran(${getText(data.start, data.end)}, tab)`,
                next
            }
        }
    }

    function simpleexptrans(data: SimpleExpression): () => CompileElement {
        return () => {
            let next: (() => CompileElement)[] = []
            
            for(let i = 0; i < data.result.length; i++) {
                let val = data.result[i]
                if(i === 0 && val.isNegative) next.push(() => 'LIT 0')
                next = [...next, ...termtrans(val.term)]

                if((i === 0 && val.isNegative) || i !== 0)
                next.push(() => (val.isNegative? 'SUB' : 'ADD'))
            }

            return {
                text: `simpleexptrans(${getText(data.start, data.end)}, tab)`,
                next
            }
        }
    }

    function termtrans(data: Term): (() => CompileElement)[] {
        return data.map(r => {
            if(typeof r === 'number') {
                return () => `LIT ${r}`
            } else if(typeof r === 'string') {
                const variable = tab.value[r]
                return () => (variable[0] === 'const'? 'LIT ' : 'LOAD ') + variable[1]
            } else if('type' in r && r.type === 'simpleExpression') {
                return simpleexptrans(r)
            } else if('operand' in r && r) {
                if(typeof r.factor === 'string') {
                    const variable = tab.value[r.factor]
                    return [() => (variable[0] === 'const'? 'LIT ' : 'LOAD ') + variable[1], operandToInstruction(r.operand)]
                }
                return [() => `LIT ${r.factor}`, operandToInstruction(r.operand)]
            }
        }).flat()
    }

    function operandToInstruction(operand: '*' | '/' | '%') {
        if(operand === '*') return () => 'MUL'
        else if(operand === '%') return () => 'MOD'
        else return () => 'DIV'
    }

}

const codeTest = `#include<stdio.h>
int main()
{ int i, n, s;
scanf("%d", &n);
i = 1;
s = 0;
while(i <= n)
{
s = s+i*i;
i = i+1;
}
printf("%d", s);
return 0;
}
`
