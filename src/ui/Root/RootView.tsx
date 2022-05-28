import BeatView from "@/ui/Beat/BeatView";
import Beat from "@/Beat";
import "./Root.css";
import BeatSettingsView from "@/ui/BeatSettings/BeatSettingsView";
import IconView from "@/ui/Widgets/Icon/IconView";
import BeatStore from "@/BeatStore";
import { Capsule, h, frag, Rung, RungOptions, ICapsule } from "@djledda/ladder";

export type RootUINodeOptions = RungOptions & {
    title: string,
    mainBeat?: Beat,
    orientation?: "horizontal" | "vertical",
};

export default class RootView extends Rung<HTMLDivElement> {
    private title: string;
    private beatView: BeatView;
    private beatStore: BeatStore;
    private activeBeat: ICapsule<Beat>;
    private beatSettingsView: BeatSettingsView;
    private currentOrientation: "horizontal" | "vertical";
    private showHideSidebarButton = Capsule.new<HTMLDivElement | null>(null);
    private sidebarActive = true;
    private sidebarLeftTabs = Capsule.new<HTMLDivElement | null>(null);

    constructor(options: RootUINodeOptions) {
        super(options);
        this.beatStore = new BeatStore({
            loadFromLocalStorage: true,
            autoSave: true,
        });
        this.activeBeat = this.beatStore.getActiveBeat();
        this.activeBeat.watch((newVal) => {
            this.beatSettingsView.setBeat(newVal);
            this.beatView.setBeat(newVal);
        });
        this.currentOrientation = this.beatStore.getSavedOrientation() ?? options.orientation ?? "horizontal";
        this.beatView = new BeatView({
            beat: this.activeBeat.val,
            orientation: this.currentOrientation,
        });
        this.beatStore.onBeatChanges(() => {
            this.sidebarLeftTabs.val?.replaceChildren(<this.Tabs />);
        });
        this.beatSettingsView = new BeatSettingsView({ beat: this.activeBeat.val });
        this.title = options.title;
        this.setOrientation(this.currentOrientation);
        this.openSidebarForDesktop();
    }

    private openSidebarForDesktop() {
        const mediaQueryList = window.matchMedia("screen and (max-width: 900px)");
        if (mediaQueryList.matches) {
            this.toggleSidebar();
        }
    }

    toggleSidebar(): void {
        this.sidebarActive = !this.sidebarActive;
        if (this.showHideSidebarButton.val) {
            this.showHideSidebarButton.val.title = this.sidebarText();
        }
        this.render().classList.toggle("sidebar-visible");
    }

    toggleOrientation(): void {
        if (this.currentOrientation === "vertical") {
            this.setOrientation("horizontal");
        } else {
            this.setOrientation("vertical");
        }
    }

    setOrientation(orientation: "horizontal" | "vertical"): void {
        this.currentOrientation = orientation;
        if (orientation === "vertical") {
            this.render().classList.add("vertical-mode");
        } else {
            this.render().classList.remove("vertical-mode");
        }
        this.beatStore.setOrientation(orientation);
        this.beatView.setOrientation(orientation);
    }

    private sidebarText(): string {
        return `${this.sidebarActive ? "Hide" : "Show"} sidebar`;
    }

    private SidebarStripLeft = (): HTMLElement => {
        return <div className={"root-sidebar-left-strip"}>
            <div saveTo={this.sidebarLeftTabs}>
                <this.Tabs />
            </div>
            <div className={"root-sidebar-add-beat"} onclick={() => this.beatStore.addNewBeat()}>+</div>
        </div> as HTMLElement;
    };

    private Tabs = (): Node => {
        return <div>
            {...this.beatStore.getBeats().map((beat) => {
                const node = <div
                    className={"root-sidebar-left-tab" + (beat === this.activeBeat.val ? " active" : "")}
                    onclick={() => this.beatStore.setActiveBeat(beat)}>
                    {beat.getName()}
                </div> as HTMLDivElement;
                this.activeBeat.watch((newVal) => {
                    if (beat === newVal) {
                        node.classList.add("active");
                    } else {
                        node.classList.remove("active");
                    }
                });
                return node;
            })}
        </div>;
    };

    private SidebarQuickButtons = (): HTMLElement => {
        return <div className={"root-sidebar-toggle"}>
            <div
                className={"root-quick-access-button"}
                title={this.sidebarText()}
                saveTo={this.showHideSidebarButton}
                onclick={() => this.toggleSidebar()}>
                {new IconView({
                    iconName: "list",
                    color: "var(--color-ui-neutral-dark)"
                })}
            </div>
            <div
                className={"root-quick-access-button"}
                title={"Change orientation"}
                onclick={() => this.toggleOrientation()}>
                {new IconView({
                    iconName: "arrowClockwise",
                    color: "var(--color-ui-neutral-dark)"
                })}
            </div>
            <div
                className={"root-quick-access-button"}
                title={"Bake all tracks"}
                onclick={() => this.activeBeat.val.bakeLoops()}>
                {new IconView({
                    iconName: "snowflake",
                    color: "var(--color-ui-neutral-dark)"
                })}
            </div>
            <div
                className={"root-quick-access-button"}
                title={"Reset all"}
                onclick={() => this.beatStore.resetActiveBeat()}>
                {new IconView({
                    iconName: "trash",
                    color: "var(--color-ui-neutral-dark)"
                })}
            </div>
        </div> as HTMLElement;
    };

    private Sidebar = (): HTMLElement => {
        return <div className={"root-sidebar"}>
            <this.SidebarStripLeft />
            <div
                className={"root-settings"}>
                <h1 className={"root-title"}>{this.title}</h1>
                {this.beatSettingsView}
            </div>
            <this.SidebarQuickButtons />
        </div> as HTMLElement;
    };

    build(): HTMLDivElement {
        return (
            <div classes={["root", "sidebar-visible"]}>
                <this.Sidebar/>
                <div className={"root-beat-stage-container"}>
                    <div className={"root-beat-stage"}>
                        {this.beatView}
                    </div>
                </div>
            </div>
        ) as HTMLDivElement;
    }
}