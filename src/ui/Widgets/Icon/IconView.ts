import UINode, {UINodeOptions} from "@/ui/UINode";
import "./Icon.css";
import List from "./svgs/list.svg";
import ArrowClockwise from "./svgs/arrow-clockwise.svg";
import Trash from "./svgs/trash.svg";

const IconUrlMap = {
    arrowClockwise: ArrowClockwise,
    list: List,
    trash: Trash,
} as const;

export type IconName = keyof typeof IconUrlMap;

export type IconViewOptions = UINodeOptions & {
    iconName: IconName,
};

export default class IconView extends UINode {
    private iconUrl: string;

    constructor(options: IconViewOptions) {
        super(options);
        this.iconUrl = IconUrlMap[options.iconName];
    }

    build(): HTMLSpanElement {
        const icon = UINode.make("div", {
            classes: ["icon-view"],
        });
        icon.style.cssText = `-webkit-mask-image: url(${this.iconUrl}); mask-image: url(${this.iconUrl});`;
        return icon;
    }
}