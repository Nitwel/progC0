type Quantifier = 'exactlyOne' | 'zeroOrOne' | 'zeroOrMore'
type Element = {type: 'wildcard', quantifier: Quantifier} |
{ type: 'groupElement', quantifier: Quantifier, states?: Element[]} |
{ type: 'element', value: string, quantifier: Quantifier }
type Expression = Element[][]

function last<T>(stack: T[] | undefined): T | undefined {
    if(stack === undefined) return undefined
    return stack[stack.length - 1]
}

export function parse(expression: string) {
    let i = 0;
    const stack: Expression = [[]];

    while(i < expression.length) {
        const next = expression[i]
        switch( next ) {
            case '.': {
                last(stack)?.push({
                    type: 'wildcard',
                    quantifier: 'exactlyOne'
                })
                i++;
                continue;
            }
            case '?': {
                const lastElement = last(last(stack));
                if(!lastElement || lastElement.quantifier !== 'exactlyOne') {
                    throw new Error('Quantifier must follow an unquantified element or group')
                }
                lastElement.quantifier = 'zeroOrOne';
                i++;
                continue;
            }
            case '*': {
                const lastElement = last(last(stack));
                if(!lastElement || lastElement.quantifier !== 'exactlyOne') {
                    throw new Error('Quantifier must follow an unquantified element or group')
                }
                lastElement.quantifier = 'zeroOrMore';
                i++;
                continue;
            }
            case '+': {
                const lastElement = last(last(stack));
                if(!lastElement || lastElement.quantifier !== 'exactlyOne') {
                    throw new Error('Quantifier must follow an unquantified element or group')
                }
                const zeroOrMoreCopy: Element = { ...lastElement, quantifier: 'zeroOrMore'}
                last(stack)?.push(zeroOrMoreCopy)
                i++;
                continue;
            }

            case '(': {
                stack.push([])
                i++;
                continue;
            }

            case ')': {
                if(stack.length <= 1) {
                    throw new Error(`No group to close at index ${i}`)
                }
                const states = stack.pop()
                last(stack)?.push({
                    type: 'groupElement',
                    states,
                    quantifier: 'exactlyOne'
                })
                i++;
                continue;
            }
            case '\\': {
                if(i + 1 >= expression.length) {
                    throw new Error(`Bad excape character at index ${i}`)
                }
                last(stack)?.push({
                    type: 'element',
                    value: expression[i + 1],
                    quantifier: 'exactlyOne'
                })
                i += 2;
                continue;
            }

            default: {
                last(stack)?.push({
                    type: 'element',
                    value: next,
                    quantifier: 'exactlyOne'
                })
                i++;
                continue
            }
        }
    }
    if(stack.length !== 1) {
        throw new Error('Unmatched groups in regular expression')
    }

    return stack[0]
}