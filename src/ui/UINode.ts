import Ref from "@/Ref";
import {ISubscription} from "@/Publisher";

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

export function frag(subs?: Node[]): DocumentFragment {
    const frag = document.createDocumentFragment();
    if (subs) {
        attachSubs(frag, subs);
    }
    return frag;
}

export function q(text: string): Text {
    return document.createTextNode(text);
}

export function h<T extends keyof HTMLElementTagNameMap>(type: T, attributes?: IRenderAttributes<T>, subNodes?: (Node | UINode | Ref)[]): HTMLElementTagNameMap[T] {
    const element = document.createElement(type);
    if (attributes) {
        if (attributes.classes) {
            element.classList.add(...attributes.classes);
        }
        if (attributes.saveTo) {
            attributes.saveTo.val = element;
        }
        applyAttributes(element, attributes);
    }
    if (subNodes) {
        attachSubs(element, subNodes);
    }
    return element;
}

function nodeRefWatcher<T>(newVal: T extends Ref<infer U> ? U : never, textNode: Text, sub: ISubscription): void {
    if (!textNode.parentNode) {
        sub.unbind();
        textNode.remove();
    } else {
        textNode.replaceWith(newVal?.toString() ?? "null");
    }
}

function attachSubs(node: Element | DocumentFragment, subNodes: (Node | UINode | Ref)[]): void {
    for (let i = 0; i < subNodes.length; i++) {
        const subNode = subNodes[i];
        if (subNode instanceof UINode) {
            node.append(subNode.render());
        } else if (subNode instanceof Ref) {
            const textNode = q(subNode.val.toString());
            const sub = subNode.watch((newVal) => nodeRefWatcher<Ref>(newVal, textNode, sub));
            node.append(textNode);
        } else {
            node.append(subNode);
        }
    }
}

function applyAttributes<T extends keyof HTMLElementTagNameMap>(element: HTMLElement, attributes: IRenderAttributes<T>): void {
    for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
            const attribute = (attributes as Record<string, unknown>)[key];
            if (attribute) {
                if (attribute instanceof Ref) {
                    const attributeAsRef = attribute as Ref;
                    const elementWithAttributeKey = element as unknown as Record<string, typeof attributeAsRef.val>;
                    elementWithAttributeKey[key] = attributeAsRef.val;
                    attribute.watch((newVal) => elementWithAttributeKey[key] = newVal);
                } else {
                    (element as unknown as ({ [key: string]: typeof attribute }))[key] = attribute;
                }
            }
        }
    }
}
