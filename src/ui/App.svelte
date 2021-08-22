<script lang="ts">
    import Store from "../Store";
    import Beat from "./Beat.svelte";

    export let store: Store;
</script>

<h1>
    ArneDrums
</h1>
<div class="main-contianer">
    <Beat beat="{store.getBeat()}"/>
</div>

<style>
    h1 {
        text-align: center;
        color: red;
    }
    .main-contianer {
        width: 100%;
    }
</style>