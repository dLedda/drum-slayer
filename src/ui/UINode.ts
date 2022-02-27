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

    constructor(options: UINodeOptions) {}

    render(): HTMLElement {
        if (!this.node) {
            this.node = this.build();
        }
        return this.node;
    }

    protected getNode(): HTMLElement {
        if (!this.node) {
            return this.render();
        } else {
            return this.node;
        }
    }

    redraw(): void {
        const oldNode = this.node;
        if (!oldNode || !this.node) {
            return;
        }
        const parent = this.node.parentElement;
        if (parent) {
            this.node = this.build();
            parent.replaceChild(this.node, oldNode);
        } else {
            this.render();
        }
    }

    protected abstract build(): HTMLElement;

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

    static q(text: string): Text {
        return document.createTextNode(text);
    }

    static frag(subs?: Node[]): DocumentFragment {
        const frag = document.createDocumentFragment();
        if (subs) {
            frag.append(...subs);
        }
        return frag;
    }
}