import UINode, {h, q, UINodeOptions} from "@/ui/UINode";
import BeatView from "@/ui/Beat/BeatView";
import Beat from "@/Beat";
import "./Root.css";
import BeatSettingsView from "@/ui/BeatSettings/BeatSettingsView";
import IconView from "@/ui/Widgets/Icon/IconView";
import Ref from "@/Ref";
import BeatStore from "@/BeatStore";

export type RootUINodeOptions = UINodeOptions & {
    title: string,
    mainBeat?: Beat,
    orientation?: "horizontal" | "vertical",
};

export default class RootView extends UINode {
    private title: string;
    private beatView: BeatView;
    private beatStore: BeatStore;
    private activeBeat: Ref<Beat>;
    private beatSettingsView: BeatSettingsView;
    private currentOrientation: "horizontal" | "vertical";
    private showHideSidebarButton: Ref<HTMLDivElement | null> = Ref.new<HTMLDivElement | null>(null);
    private sidebarActive = true;
    private sidebarLeftTabs: Ref<HTMLDivElement | null> = Ref.new<HTMLDivElement | null>(null);

    constructor(options: RootUINodeOptions) {
        super(options);
        this.beatStore = new BeatStore({
            loadFromLocalStorage: true,
            autoSave: true,
        });
        this.currentOrientation = options.orientation ?? "horizontal";
        this.activeBeat = this.beatStore.getActiveBeat();
        this.activeBeat.watch((newVal) => {
            this.beatSettingsView.setBeat(newVal);
            this.beatView.setBeat(newVal);
        });
        this.beatView = new BeatView({
            beat: this.activeBeat.val,
            orientation: this.currentOrientation,
        });
        this.beatStore.onBeatChanges(() => {
            this.sidebarLeftTabs.val?.replaceChildren(...this.buildTabs());
        });
        this.beatSettingsView = new BeatSettingsView({beat: this.activeBeat.val});
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
        this.showHideSidebarButton.val!.title = this.sidebarText();
        this.getNode().classList.toggle("sidebar-visible");
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
            this.getNode().classList.add("vertical-mode");
        } else {
            this.getNode().classList.remove("vertical-mode");
        }
        this.beatView.setOrientation(orientation);
    }

    private sidebarText(): string {
        return `${this.sidebarActive ? "Hide" : "Show"} sidebar`;
    }

    private buildSidebarStripLeft(): HTMLElement {
        return h("div", {
            className: "root-sidebar-left-strip",
        }, [
            h("div", {
                className: "root-sidebar-add-beat",
                onclick: () => this.beatStore.addNewBeat(),
                innerText: "+",
            }),
            h("div", {
                saveTo: this.sidebarLeftTabs
            }, this.buildTabs()),
        ]);
    }

    private buildTabs(): HTMLElement[] {
        return this.beatStore.getBeats().map((beat) => {
            const node = h("div", {
                className: "root-sidebar-left-tab" + (beat === this.activeBeat.val ? " active" : ""),
                onclick: () => this.beatStore.setActiveBeat(beat),
                innerText: beat.getName(),
            });
            this.activeBeat.watch((newVal) => {
                if (beat === newVal) {
                    node.classList.add("active");
                } else {
                    node.classList.remove("active");
                }
            });
            return node;
        }).reverse();
    }

    private buildSidebarQuickButtons(): HTMLElement {
        return h("div", {
            classes: ["root-sidebar-toggle"],
        }, [
            h("div", {
                classes: ["root-quick-access-button"],
                title: this.sidebarText(),
                saveTo: this.showHideSidebarButton,
                onclick: () => this.toggleSidebar(),
            }, [
                new IconView({
                    iconName: "list",
                    color: "var(--color-ui-neutral-dark)"
                })
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Change orientation",
                onclick: () => this.toggleOrientation(),
            }, [
                new IconView({
                    iconName: "arrowClockwise",
                    color: "var(--color-ui-neutral-dark)"
                }),
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Bake all tracks",
                onclick: () => this.activeBeat.val.bakeLoops(),
            }, [
                new IconView({
                    iconName: "snowflake",
                    color: "var(--color-ui-neutral-dark)"
                }),
            ]),
            h("div", {
                classes: ["root-quick-access-button"],
                title: "Reset all",
                onclick: () => this.beatStore.resetActiveBeat(),
            }, [
                new IconView({
                    iconName: "trash",
                    color: "var(--color-ui-neutral-dark)"
                })
            ]),
        ]);
    }

    private buildSidebar(): HTMLElement {
        return (
            h("div", {classes: ["root-sidebar"]}, [
                this.buildSidebarStripLeft(),
                h("div", {classes: ["root-settings"]}, [
                    h("h1", {classes: ["root-title"], innerText: this.title}),
                    this.beatSettingsView,
                ]),
                this.buildSidebarQuickButtons(),
            ])
        );
    }

    build(): HTMLElement {
        return (
            h("div", {classes: ["root", "sidebar-visible"]}, [
                this.buildSidebar(),
                h("div", {classes: ["root-beat-stage-container"]}, [
                    h("div", {classes: ["root-beat-stage"]}, [
                        this.beatView,
                    ])
                ])
            ])
        );
    }
}