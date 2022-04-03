import "./Dropdown.css";
import UINode, {h, UINodeOptions} from "@/ui/UINode";
import Ref, {MaybeRef} from "@/Ref";

export type DropdownViewOption = {
    label: string,
    value: string,
};

export type DropdownUINodeOptions = UINodeOptions & {
    options: MaybeRef<DropdownViewOption[]>,
};

export default class DropdownView extends UINode {
    private options: Ref<DropdownViewOption[]>;
    private select = Ref.new<HTMLSelectElement | null>(null);

    constructor(options: DropdownUINodeOptions) {
        super(options);
        this.options = Ref.new(options.options);
        this.options.watch((newVal) => this.updateOptionsFrom(newVal));
    }

    private updateOptionsFrom(newOptions: DropdownViewOption[]): void {
        const select = this.select.val;
        if (!select) {
            return;
        }
        const children = new Array(...select.children) as HTMLOptionElement[];
        for (let i = 0; i < newOptions.length; i++) {
            if (children[i]) {
                children[i].label = newOptions[i].label;
                children[i].value = newOptions[i].value;
            } else {
                children.push(h("option", {
                    label: newOptions[i].label,
                    value: newOptions[i].value,
                }));
            }
        }
        if (children.length - newOptions.length > 0) {
            children.splice(newOptions.length, children.length - newOptions.length).forEach(child => child.remove());
        }
        select.replaceChildren(...children);
    }

    protected build(): HTMLSelectElement {
        return h("select", {
            saveTo: this.select,
        }, this.options.val.map(opt => h("option", {label: opt.label})));
    }
}
