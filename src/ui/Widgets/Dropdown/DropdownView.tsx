import "./Dropdown.css";
import { Capsule, h, ICapsule, Rung, RungOptions } from "@djledda/ladder";

export type DropdownViewOption = {
    label: string,
    value: string,
};

export type DropdownUINodeOptions = RungOptions & {
    options: ICapsule<DropdownViewOption[]> | DropdownViewOption[],
};

export default class DropdownView extends Rung {
    private options: ICapsule<DropdownViewOption[]>;
    private select = Capsule.new<HTMLSelectElement | null>(null);

    constructor(options: DropdownUINodeOptions) {
        super(options);
        this.options = Capsule.new(options.options);
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
                children.push(<option label={newOptions[i].label} value={newOptions[i].value} /> as HTMLOptionElement);
            }
        }
        if (children.length - newOptions.length > 0) {
            children.splice(newOptions.length, children.length - newOptions.length).forEach(child => child.remove());
        }
        select.replaceChildren(...children);
    }

    protected build(): HTMLSelectElement {
        return <select saveTo={this.select}>
            {this.options.val.map(opt => <option label={opt.label} />)}
        </select> as HTMLSelectElement;
    }
}
