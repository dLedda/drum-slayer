import "./BoolBox.css";
import UINode, {UINodeOptions} from "../../UINode";

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

    rebuild(): HTMLDivElement {
        this.labelElement = UINode.make("label", {
            classes: ["bool-box-label"],
            innerText: this.label ?? "",
        });
        if (this.label !== null) {
            this.labelElement.classList.add("visible");
        }
        this.checkboxElement = UINode.make("input", {
            type: "checkbox",
            classes: ["bool-box-checkbox"],
            oninput: (event: Event) => this.onInput((event.target as HTMLInputElement).checked),
        });
        return UINode.make("div", {
            classes: ["bool-box"],
            subs: [
                this.labelElement,
                this.checkboxElement,
            ],
        });
    }
}