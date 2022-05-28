import RootView from "@/ui/Root/RootView";
import "@/ui/global.css";

const appNode = document.querySelector("#app");

if (appNode) {
    try {
        const appRoot = new RootView({
            orientation: "vertical",
            title: "Drum Slayer",
        });
        window.appRoot = appRoot;
        appNode.appendChild(appRoot.render());
        console.log("OK!");
    } catch (e) {
        console.error("FUCK!", e);
    }
} else {
    console.error("FUCK!");
}