import App from './ui/App.svelte';
import Store from "./Store";

const app = new App({
    target: document.body,
    props: {
        store: new Store({
            bars: 10,
            timeSig: {
                down: 4,
                up: 4,
            },
            drumSchema: ['LF', 'LH', 'RH', 'RF'],
        }),
    },
});

export default app;