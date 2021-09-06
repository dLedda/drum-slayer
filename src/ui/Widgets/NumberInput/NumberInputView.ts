import UINode, { UINodeOptions } from "../../UINode";
import "./NumberInput.css";

type NumberInputUINodeOptionsBase = UINodeOptions & {
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

export default class NumberInputView extends UINode {
    private labelElement!: HTMLLabelElement;
    private mainElement!: HTMLDivElement;
    private inputElement!: HTMLInputElement;
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

    disable(): void {
        this.mainElement.classList.add("disabled");
        this.inputElement.disabled = true;
    }

    enable(): void {
        this.mainElement.classList.remove("disabled");
        this.inputElement.disabled = false;
    }

    setValue(value: number): void {
        this.value = value;
        this.inputElement.valueAsNumber = value;
    }

    rebuild(): HTMLDivElement {
        this.labelElement = UINode.make("label", {
            classes: ["number-input-label", this.labelPosition],
            innerText: this.label ?? "",
        });
        if (this.label !== null) {
            this.labelElement.classList.add("visible");
        }
        this.inputElement = UINode.make("input", {
            type: "number",
            classes: ["number-input-input"],
            valueAsNumber: this.value,
            onblur: (event: Event) => {
                const input = (event.target as HTMLInputElement).valueAsNumber;
                if (!isNaN(input)) {
                    if (this.onNewInput) {
                        this.onNewInput(input);
                    } else if (this.setter) {
                        this.setter(input);
                    }
                }
            },
        });
        this.mainElement = UINode.make("div", {
            classes: ["number-input"],
            subs: [
                this.labelElement,
                UINode.make("button", {
                    innerText: "-",
                    classes: ["number-input-button", "number-input-dec"],
                    onclick: () => {
                        if (this.onDecrement) {
                            this.onDecrement();
                        } else if (this.setter && this.getter) {
                            this.setter(this.getter() - 1);
                        }
                    },
                }),
                this.inputElement,
                UINode.make("button", {
                    innerText: "+",
                    classes: ["number-input-button", "number-input-inc"],
                    onclick: () => {
                        if (this.onIncrement) {
                            this.onIncrement();
                        } else if (this.setter && this.getter) {
                            this.setter(this.getter() + 1);
                        }
                    },
                }),
            ],
        });
        return this.mainElement;
    }
}