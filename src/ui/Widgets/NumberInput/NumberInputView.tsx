import "./NumberInput.css";
import { Capsule, h, Rung, RungOptions } from "@djledda/ladder";

type NumberInputUINodeOptionsBase = RungOptions & {
    label?: string,
    initialValue?: number,
    labelPosition?: "top" | "left",
}

type NumberInputUINodeOptionsIncDecInput = NumberInputUINodeOptionsBase & {
    onIncrement: () => void,
    onDecrement: () => void,
    onNewInput: (input: number) => void,
    setter?: never,
    getter?: never,
};

type NumberInputUINodeOptionsGetSet = NumberInputUINodeOptionsBase & {
    onIncrement?: never,
    onDecrement?: never,
    onNewInput?: never,
    setter: (input: number) => void,
    getter: () => number,
};

export type NumberInputUINodeOptions = NumberInputUINodeOptionsGetSet | NumberInputUINodeOptionsIncDecInput;

export default class NumberInputView extends Rung<HTMLDivElement> {
    private labelElement = Capsule.new<HTMLLabelElement | null>(null);
    private inputElement = Capsule.new<HTMLInputElement | null>(null);
    private labelPosition: "top" | "left";
    private value: number;
    private label: string | null;
    private onIncrement: (() => void) | null;
    private onDecrement: (() => void) | null;
    private setter: ((input: number) => void) | null;
    private getter: (() => number) | null;
    private onNewInput: ((input: number) => void) | null;

    constructor(options: NumberInputUINodeOptions) {
        super(options);
        this.labelPosition = options.labelPosition ?? "top";
        this.label = options.label ?? "";
        this.value = options.initialValue ?? 0;
        this.onDecrement = options.onDecrement ?? null;
        this.setter = options.setter ?? null;
        this.getter = options.getter ?? null;
        this.onIncrement = options.onIncrement ?? null;
        this.onNewInput = options.onNewInput ?? null;
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

    disable(): void {
        this.render().classList.add("disabled");
        this.inputElement.val!.disabled = true;
    }

    enable(): void {
        this.render().classList.remove("disabled");
        this.inputElement.val!.disabled = false;
    }

    setValue(value: number): void {
        this.value = value;
        this.inputElement.val!.valueAsNumber = value;
    }

    build(): HTMLDivElement {
        const labelClasses = ["number-input-label", this.labelPosition];
        if (this.label !== null) {
            labelClasses.push("visible");
        }
        return <div className={"number-input"}>
            <label
                classes={labelClasses}
                saveTo={this.labelElement}>
                {this.label ?? ""}
            </label>
            <button
                classes={["number-input-button", "number-input-dec"]}
                onclick={() => {
                    if (this.onDecrement) {
                        this.onDecrement();
                    } else if (this.setter && this.getter) {
                        this.setter(this.getter() - 1);
                    }
                }}>
                -
            </button>
            <input
                type={"number"}
                saveTo={this.inputElement}
                className={"number-input-input"}
                valueAsNumber={this.value}
                onblur={(event: Event) => {
                    const input = (event.target as HTMLInputElement).valueAsNumber;
                    if (!isNaN(input)) {
                        if (this.onNewInput) {
                            this.onNewInput(input);
                        } else if (this.setter) {
                            this.setter(input);
                        }
                    }
                }} />
            <button
                classes={["number-input-button", "number-input-inc"]}
                onclick={() => {
                    if (this.onIncrement) {
                        this.onIncrement();
                    } else if (this.setter && this.getter) {
                        this.setter(this.getter() + 1);
                    }
                }}>
                +
            </button>
        </div> as HTMLDivElement;
    }
}