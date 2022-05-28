import "./EditableTextFieldView.css";
import { Rung, h, RungOptions } from "@djledda/ladder";

export type EditableTextFieldViewOptions = RungOptions & {
    initialText?: string,
    setter?: (newString: string) => void,
    noEmpty?: boolean,
};

export default class EditableTextFieldView extends Rung {
    private text: string;
    private titleInput!: HTMLInputElement;
    private setter: (newString: string) => void;
    private titleDisplay!: HTMLElement;
    private noEmpty: boolean;
    private lastNonEmptyInput = "";

    constructor(options: EditableTextFieldViewOptions) {
        super(options);
        this.setter = options.setter ?? (() => {/* dummy */});
        this.text = options.initialText ?? "";
        this.noEmpty = options.noEmpty ?? false;
    }

    setText(newText: string): void {
        if (newText !== "" || !this.noEmpty) {
            this.text = newText;
            this.titleInput.value = this.text;
            this.titleDisplay.innerText = this.text;
        }
    }

    build(): Node {
        this.titleInput = <input
            value={this.text}
            className={"editable-text-field-view"}
            type={"text"}
            oninput={(event: Event) => {
                const input = (event.target as HTMLInputElement).value;
                if (input === "") {
                    if (!this.noEmpty) {
                        this.setter(input);
                    }
                } else {
                    this.setter(input);
                    this.lastNonEmptyInput = input;
                }
            }}
            onblur={(event: FocusEvent) => {
                if ((event.target as HTMLInputElement).value === "") {
                    this.setText(this.lastNonEmptyInput);
                }
                this.titleInput.replaceWith(this.titleDisplay);
            }}
            onkeyup={(event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    (event.target as HTMLInputElement).blur();
                }
            }}
        /> as HTMLInputElement;

        this.titleDisplay = <div
            innerText={this.text}
            className={"editable-text-field-view"}
            onclick={() => {
                this.titleDisplay.replaceWith(this.titleInput);
                this.titleInput.focus();
            }} /> as HTMLDivElement;

        return this.titleDisplay;
    }
}