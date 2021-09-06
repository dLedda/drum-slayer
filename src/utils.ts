export function isPosInt(maybePosInt: number): boolean {
    return (maybePosInt | 0) === maybePosInt && maybePosInt > 0;
}

export function greatestCommonDivisor(a: number, b: number): number {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}