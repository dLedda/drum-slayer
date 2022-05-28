import "./Icon.css";
import List from "assets/svgs/list.svg";
import ArrowClockwise from "assets/svgs/arrow-clockwise.svg";
import Trash from "assets/svgs/trash.svg";
import Snowflake from "assets/svgs/snowflake.svg";
import { h, Rung, RungOptions } from "@djledda/ladder";

const IconUrlMap = {
    arrowClockwise: ArrowClockwise,
    list: List,
    trash: Trash,
    snowflake: Snowflake,
} as const;

export type IconName = keyof typeof IconUrlMap;

export type IconViewOptions = RungOptions & {
    iconName: IconName,
    color?: string,
};

export default class IconView extends Rung {
    private iconUrl: string;
    private color: string | null;

    constructor(options: IconViewOptions) {
        super(options);
        this.color = options.color ?? null;
        this.iconUrl = IconUrlMap[options.iconName];
    }

    build(): HTMLSpanElement {
        const icon = <div className={"icon-view"} /> as HTMLDivElement;
        const colorString = this.color ? `--icon-bg:${this.color}` : "";
        icon.style.cssText = `-webkit-mask-image: url(${this.iconUrl}); mask-image: url(${this.iconUrl});${colorString}`;
        return icon;
    }
}