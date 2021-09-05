import "./main.css";
import BeatGroup from "./BeatGroup";
import RootView from "./ui/Root/RootView";

const defaultSettings = {
    barCount: 2,
    isLooping: false,
    timeSigUp: 8,
};

const mainBeatGroup = new BeatGroup(defaultSettings);
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
        title: "Drum Slayer",
        mainBeatGroup: mainBeatGroup,
    });
    //@ts-ignore
    window.appRoot = appRoot;
    appNode.appendChild(appRoot.render());
    console.log("OK!");
} else {
    console.error("FUCK!");
}