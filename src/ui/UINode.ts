import Ref from "@/Ref";

export type UINodeOptions = {

};

type IRenderAttributes<T extends keyof HTMLElementTagNameMap> = Partial<{
    [K in keyof HTMLElementTagNameMap[T]]: HTMLElementTagNameMap[T][K] | Ref<HTMLElementTagNameMap[T][K]>
}> & {
    classes?: string[],
    saveTo?: Ref<HTMLElementTagNameMap[T] | null>,
};

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
    T extends keyof HTMLElementTagNameMap>(
    type: T,
    attributes: IRenderAttributes<T>,
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
                const attribute = (attributes as any)[key];
                if (attribute instanceof Ref) {
                    element[key as keyof HTMLElementTagNameMap[T]] = attribute.val;
                    attribute.watch((newVal) => element[key as keyof HTMLElementTagNameMap[T]] = newVal);
                } else {
                    element[key as keyof HTMLElementTagNameMap[T]] = attribute;
                }
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