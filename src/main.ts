import App from "./ui/App.svelte";
import Store from "./Store";

const defaultSettings = {
    bars: 10,
    timeSig: {
        down: 4,
        up: 4,
    },
};

const store = new Store({
    beats: [
        {
            name: "LF",
            ...defaultSettings,
        },
        {
            name: "LH",
            ...defaultSettings,
        },
        {
            name: "RH",
            ...defaultSettings,
        },
        {
            name: "RF",
            ...defaultSettings,
        }
    ]
});

const app = new App({
    target: document.body,
    props: {store},
});

export default app;