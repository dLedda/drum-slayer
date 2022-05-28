import "./BoolBox.css";
import { Capsule, h, Rung, RungOptions } from "@djledda/ladder";

export type BoolBoxUINodeOptions = RungOptions & {
    label?: string,
    value?: boolean,
    onInput?: (isChecked: boolean) => void,
};

export default class BoolBoxView extends Rung {
    private label: string | null;
    private labelElement = Capsule.new<HTMLLabelElement | null>(null);
    private checkboxElement = Capsule.new<HTMLInputElement | null>(null);
    private onInput: (isChecked: boolean) => void;

    constructor(options: BoolBoxUINodeOptions) {
        super(options);
        this.label = options.label ?? "";
        this.onInput = options.onInput ?? (() => { /* dummy */ });
    }

    setLabel(newLabel: string | null): void {
        if (!this.labelElement.val) {
            return;
        }
        if (newLabel !== null) {
            this.label = newLabel;
            this.labelElement.val.innerText = newLabel;
            this.labelElement.val.classList.add("visible");
        } else {
            this.label = newLabel;
            this.labelElement.val.innerText = "";
            this.labelElement.val.classList.remove("visible");
        }
    }

    setValue(isChecked: boolean): void {
        if (this.checkboxElement.val) {
            this.checkboxElement.val.checked = isChecked;
        }
    }

    build(): HTMLDivElement {
        return <div className={"bool-box"}>
            <label
                saveTo={this.labelElement}
                classes={this.label ? ["bool-box-label", "visible"] : ["bool-box-label"]}
                onclick={() => this.onInput(!this.checkboxElement.val?.checked)}>
                {this.label ?? ""}
            </label>
            <input
                type={"checkbox"}
                className={"bool-box-checkbox"}
                saveTo={this.checkboxElement}
                onclick={(event: Event) => this.onInput((event.target as HTMLInputElement).checked)}/>
        </div> as HTMLDivElement;
    }
}