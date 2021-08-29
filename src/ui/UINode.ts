export type UINodeOptions = {

};

type IRenderAttributes<
    T extends keyof HTMLElementTagNameMap,
    K extends keyof HTMLElementTagNameMap[T]
    > = Partial<Record<K, HTMLElementTagNameMap[T][K]> & {
    classes: string[],
    subs: HTMLElement[],
}>;

export default abstract class UINode {
    protected node: HTMLElement | null = null;

    constructor(options: UINodeOptions) {
    }

    abstract rebuild(): HTMLElement;

    static make<
            T extends keyof HTMLElementTagNameMap,
            K extends keyof HTMLElementTagNameMap[T]>(
        type: T,
        attributes: IRenderAttributes<T, K>
    ): HTMLElementTagNameMap[T] {
        const element = document.createElement(type);
        if (attributes) {
            for (const key in attributes) {
                if (key === "classes") {
                    element.classList.add(...attributes[key]!);
                } else if (key === "subs") {
                    element.append(...attributes.subs!);
                } else {
                    element[key as keyof HTMLElementTagNameMap[T]] = (attributes as any)[key];
                }
            }
        }
        return element;
    }
}