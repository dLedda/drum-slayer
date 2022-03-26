import "./ActionButton.css";
import UINode, {UINodeOptions} from "@/ui/UINode";
import IconView, {IconName} from "@/ui/Widgets/Icon/IconView";

export type ActionButtonUINodeOptions = UINodeOptions & {
    type?: "primary" | "secondary",
    onClick?: (event: MouseEvent) => void,
    alt?: string,
    disabled?: boolean,
} & ({
    icon: IconName,
    label?: never,
} | {
    label: string,
    icon?: never,
});

export default class ActionButtonView extends UINode {
    private label: string | null = null;
    private icon: IconName | null = null;
    private buttonElement!: HTMLButtonElement;
    private onClick: (event: MouseEvent) => void;
    private type: "primary" | "secondary";
    private alt: string | null;
    private disabled: boolean;

    constructor(options: ActionButtonUINodeOptions) {
        super(options);
        if (typeof options.icon !== "undefined") {
            this.icon = options.icon;
        } else if (typeof options.label !== "undefined") {
            this.label = options.label;
        }
        this.disabled = options.disabled ?? false;
        this.alt = options.alt ?? null;
        this.type = options.type ?? "primary";
        this.onClick = options.onClick ?? (() => { /* dummy */ });
    }

    setDisabled(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.buttonElement.disabled = this.disabled;
        if (isDisabled) {
            this.buttonElement.classList.add("disabled");
        } else {
            this.buttonElement.classList.remove("disabled");
        }
    }

    protected build(): HTMLButtonElement {
        this.buttonElement = UINode.make("button", {
            classes: ["action-button", `action-button-${this.type}`],
            onclick: (event: MouseEvent) => this.disabled || this.onClick(event)
        }, [
            this.icon !== null ? new IconView({
                iconName: this.icon,
                color: "var(--color-p-light)",
            }).render() : UINode.make("span", {
                innerText: this.label ?? ""
            }),
        ]);
        if (this.alt) {
            this.buttonElement.title = this.alt;
        }
        if (this.disabled) {
            this.buttonElement.classList.add("disabled");
        }
        return this.buttonElement;
    }
}
