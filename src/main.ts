import RootView from "@/ui/Root/RootView";
import "@/ui/global.css";
import { bootstrap } from "@djledda/ladder";

try {
    const appRoot = new RootView({
        orientation: "vertical",
        title: "Drum Slayer",
    });
    window.appRoot = appRoot;
    bootstrap(appRoot, "app");
    console.log("OK!");
} catch (e) {
    console.error("FUCK!", e);
}
