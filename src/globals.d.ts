import RootView from "@/ui/Root/RootView";

declare global {
    interface Window {
        appRoot?: RootView;
    }
}

export {};
