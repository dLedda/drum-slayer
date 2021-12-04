import "./ActionButton.css";
import UINode, {UINodeOptions} from "../../UINode";

export type ActionButtonUINodeOptions = UINodeOptions & {
    label: string,
    type?: "primary" | "secondary",
    onClick?: (isChecked: boolean) => void,
};

export default class ActionButtonView extends UINode {
    private label: string | null;
    private buttonElement!: HTMLButtonElement;
    private onClick: (isChecked: boolean) => void;
    private type: "primary" | "secondary";

    constructor(options: ActionButtonUINodeOptions) {
        super(options);
        this.label = options.label ?? "";
        this.type = options.type ?? "primary";
        this.onClick = options.onClick ?? (() => { /* dummy */ });
    }

    setLabel(newLabel: string | null): void {
        if (newLabel !== null) {
            this.buttonElement.innerText = newLabel;
        } else {
            this.buttonElement.innerText = "";
        }
    }

    rebuild(): HTMLButtonElement {
        this.buttonElement = UINode.make("button", {
            classes: ["action-button", `action-button-${this.type}`],
            innerText: this.label ?? "",
            onclick: this.onClick,
        });
        return this.buttonElement;
    }
}