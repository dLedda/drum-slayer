import Ref from "@/Ref";

export type UINodeOptions = {

};

type IRenderAttributes<
    T extends keyof HTMLElementTagNameMap,
    K extends keyof HTMLElementTagNameMap[T]
    > = Partial<Record<K, HTMLElementTagNameMap[T][K]> & {
    classes: string[],
    saveTo: Ref<HTMLElementTagNameMap[T] | null>,
}>;

export default abstract class UINode {
    protected node: HTMLElement | null = null;

    constructor(options: UINodeOptions) { /* dummy */ }

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
}

export function h<
    T extends keyof HTMLElementTagNameMap,
    K extends keyof HTMLElementTagNameMap[T]>(
    type: T,
    attributes: IRenderAttributes<T, K>,
    subNodes?: (Node | UINode | Ref<any>)[],
): HTMLElementTagNameMap[T] {
    const element = document.createElement(type);
    if (attributes) {
        for (const key in attributes) {
            if (key === "classes") {
                element.classList.add(...attributes[key]!);
            } else if (key === "saveTo") {
                attributes.saveTo!.val = element;
            } else {
                element[key as keyof HTMLElementTagNameMap[T]] = (attributes as any)[key];
            }
        }
    }
    if (subNodes) {
        for (let i = 0; i < subNodes.length; i++) {
            const subNode = subNodes[i];
            if (subNode instanceof UINode) {
                element.append(subNode.render());
            } else if (subNode instanceof Ref) {
                subNode.watch((newVal) => element.childNodes.item(i).replaceWith(newVal.toString()));
                element.append(q(subNode.val.toString()));
            } else {
                element.append(subNode);
            }
        }
    }
    return element;
}

export function q(text: string): Text {
    return document.createTextNode(text);
}

export function frag(subs?: Node[]): DocumentFragment {
    const frag = document.createDocumentFragment();
    if (subs) {
        frag.append(...subs);
    }
    return frag;
}