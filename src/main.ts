import "./main.css";
import BeatGroup from "./BeatGroup";
import RootView from "./ui/Root/RootView";

const defaultSettings = {
    bars: 10,
    timeSig: {
        down: 4,
        up: 4,
    },
};

const mainBeatGroup = new BeatGroup();
mainBeatGroup.addBeat({
    name: "LF"
});
mainBeatGroup.addBeat({
    name: "LH"
});
mainBeatGroup.addBeat({
    name: "RH"
});
mainBeatGroup.addBeat({
    name: "RF"
});

const appNode = document.querySelector("#app");

if (appNode) {
    const appRoot = new RootView({
        parent: appNode as HTMLDivElement,
        title: "Drum Slayer",
        mainBeatGroup: mainBeatGroup,
    });
    //@ts-ignore
    window.appRoot = appRoot;
    appRoot.render();
    console.log("OK!");
} else {
    console.error("FUCK!");
}