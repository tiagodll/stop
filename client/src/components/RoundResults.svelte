<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let isHost=false, game={}, round=[];

    function markAnswerIfHost(player, topic){
        if(isHost)
            dispatch('markAnswer', { player: player, topic: topic});
    }
</script>

{#if isHost}
    <p>Click to mark invalid answers</p>
{/if}

<table class="nes-table is-bordered is-justified" class:is-host="{isHost}">
    <thead>
        <tr>
            <th>Player</th>
            {#each round as item }
                <th>{item.player}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
    {#each game.topics as topic, i }
        <tr>
            <td class="topic">{topic}</td>
            {#each round as item }
                <td class="answer" on:click={markAnswerIfHost(item.player, game.topics[i])}>
                    {item.answers[i]}
                </td>
            {/each}
        </tr>
    {/each}
    </tbody>
    <tfoot>
        <tr>
            <td>Totals:</td>
            {#each round as item}
                <td>{item.score}</td>
            {/each}
        </tr>
    </tfoot>
</table>

<style>
    .is-justified{
        width: 100%;
    }
    .nes-table td.unique{
        background-color: green;
    }
    .nes-table.is-host td.answer:hover{
        background-color: maroon;
    }
    .nes-table.is-host td.answer:hover .i{
        display: inline-block;
    }
    .nes-table th{
        color: white;
        background-color: darkblue;
    }
    .nes-table tfoot td{
        color: white;
        background-color: darkblue;
    }
    .nes-table td.topic{
        background-color: teal;
    }
</style>