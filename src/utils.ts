export function isPosInt(maybePosInt: number): boolean {
    return (maybePosInt | 0) === maybePosInt && maybePosInt > 0;
}