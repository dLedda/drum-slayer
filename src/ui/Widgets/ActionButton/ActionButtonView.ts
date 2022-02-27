import "./ActionButton.css";
import UINode, {UINodeOptions} from "@/ui/UINode";
import IconView, {IconName} from "@/ui/Widgets/Icon/IconView";

export type ActionButtonUINodeOptions = UINodeOptions & {
    type?: "primary" | "secondary",
    onClick?: (isChecked: boolean) => void,
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
    private onClick: (isChecked: boolean) => void;
    private type: "primary" | "secondary";

    constructor(options: ActionButtonUINodeOptions) {
        super(options);
        if (typeof options.icon !== "undefined") {
            this.icon = options.icon;
        } else if (typeof options.label !== "undefined") {
            this.label = options.label;
        }
        this.type = options.type ?? "primary";
        this.onClick = options.onClick ?? (() => { /* dummy */ });
    }

    protected build(): HTMLButtonElement {
        this.buttonElement = UINode.make("button", {
            classes: ["action-button", `action-button-${this.type}`],
            onclick: this.onClick,
            subs: [
                this.icon !== null ? new IconView({
                    iconName: this.icon
                }).render() : UINode.make("span", {
                    innerText: this.label ?? ""
                }),
            ],
        });
        return this.buttonElement;
    }
}
