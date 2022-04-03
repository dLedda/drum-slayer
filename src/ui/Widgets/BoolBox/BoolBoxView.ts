import "./BoolBox.css";
import UINode, {h, UINodeOptions} from "@/ui/UINode";
import Ref from "@/Ref";

export type BoolBoxUINodeOptions = UINodeOptions & {
    label?: string,
    value?: boolean,
    onInput?: (isChecked: boolean) => void,
};

export default class BoolBoxView extends UINode {
    private label: string | null;
    private labelElement!: HTMLLabelElement;
    private checkboxElement!: HTMLInputElement;
    private onInput: (isChecked: boolean) => void;

    constructor(options: BoolBoxUINodeOptions) {
        super(options);
        this.label = options.label ?? "";
        this.onInput = options.onInput ?? (() => { /* dummy */ });
    }

    setLabel(newLabel: string | null): void {
        if (newLabel !== null) {
            this.label = newLabel;
            this.labelElement.innerText = newLabel;
            this.labelElement.classList.add("visible");
        } else {
            this.label = newLabel;
            this.labelElement.innerText = "";
            this.labelElement.classList.remove("visible");
        }
    }

    setValue(isChecked: boolean): void {
        this.checkboxElement.checked = isChecked;
    }

    build(): HTMLDivElement {
        this.labelElement = h("label", {
            classes: ["bool-box-label"],
            onclick: () => {
                this.onInput(!this.checkboxElement.checked);
            },
        });
        if (this.label !== null) {
            this.labelElement.innerText = this.label;
            this.labelElement.classList.add("visible");
        }
        this.checkboxElement = h("input", {
            type: "checkbox",
            classes: ["bool-box-checkbox"],
            onclick: (event: Event) => {
                this.onInput((event.target as HTMLInputElement).checked);
            },
        });
        return h("div", {
            classes: ["bool-box"],
        },[
            this.labelElement,
            this.checkboxElement,
        ]);
    }
}