<script lang="ts">
    import type Beat from "../Beat";
    import BeatUnit from "./BeatUnit.svelte";

    export let beat: Beat;
    export let landscape: boolean = true;

    beat.onUpdate(() => {
        beat = beat;
    });

    $: timeSigUp = beat.getTimeSigUp();
    $: barCount = beat.getBarCount();
    $: drumSchema = beat.getDrumSchema();

    function addBar() {
        beat.setBars(beat.getBarCount() + 1);
    }

    function removeBar() {
        beat.setBars(beat.getBarCount() - 1);
    }

    function handleInputTimeSigUp(e: InputEvent) {
        const sigUp = Number((e.target as HTMLInputElement).value);
        beat.setTimeSignature(sigUp, beat.getTimeSigDown());
    }

    function handleInputTimeSigDown(e: InputEvent) {
        const sigDown = Number((e.target as HTMLInputElement).value);
        beat.setTimeSignature(beat.getTimeSigUp(), sigDown);
    }
</script>

<h1>Beat</h1>

<button on:click={addBar}>Add Bar</button>
<button on:click={removeBar}>Remove Bar</button>
<button on:click={() => landscape = !landscape}>Toggle View</button>
<h3>Time Sig</h3>
<input type="text" value="{beat.getTimeSigUp()}" on:input={handleInputTimeSigUp}/>
<p>---</p>
<input type="text" value="{beat.getTimeSigDown()}" on:input={handleInputTimeSigDown}/>

<div class="lines" class:landscape={landscape}>
    {#each drumSchema as drumSchemaKey}
        <div class="drum-line">
            <h3>{drumSchemaKey}</h3>
            {#each {length: barCount} as _, barIndex}
                <div class="bar">
                    {#each {length: timeSigUp} as _, noteIndex}
                        <div class="unit">
                            <BeatUnit unit="{beat.getUnit(drumSchemaKey, timeSigUp*barIndex + noteIndex)}"/>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    {/each}
</div>


<style>
    h1 {
        color: red;
        text-align: center;
    }
    .unit {
        display: block;
    }
    .lines.landscape .unit {
        display: inline-block;
    }
    .bar {
        display: block;
        margin-bottom: 1em;
    }
    .lines.landscape .bar {
        display: inline-block;
        margin-bottom: 0;
        margin-right: 1em;
    }
    .drum-line {
        display: block;
        overflow-x: scroll;
    }
    .drum-line h3 {
        display: inline-block;
        width: 3em;
    }
    .lines.landscape .drum-line {
        display: inline-block;
    }
    .lines {
        width: 100%;
        justify-content: center;
        display: flex;
        flex-direction: row;
        margin: auto;
    }
    .lines.landscape {
        flex-direction: column;
    }
</style>