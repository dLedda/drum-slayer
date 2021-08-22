<script lang="ts">
    import type BeatUnit from "../BeatUnit";
    import {BeatUnitType} from "../BeatUnit";

    export let unit: BeatUnit;

    unit.onUpdate(() => {
        unit = unit;
    });

    $: ghost = unit.getType() === BeatUnitType.GhostNote;
    $: active = unit.isOn();

    function onClick() {
        unit.toggle();
    }
</script>

<div class="unit" class:ghost={ghost} class:active={active} on:click={onClick}>
</div>

<style>
    .unit {
        height: 2em;
        width: 2em;
        background-color: white;
        border: solid black 1px;
    }
    .active {
        background-color: #d97474;
    }
    .ghost {
        background-color: #bc8787;
    }
</style>