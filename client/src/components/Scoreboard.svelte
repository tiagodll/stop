<script>
    export let game = {}, scores = [];
</script>

<div>
    <p>Scoreboard:</p>
        <table class="nes-table is-bordered is-justified">
            <thead>
                <tr>
                    <th>Player</th>
                    {#each game.players as player}
                        <th>{player}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
            {#each scores as item}
                <tr>
                <td class="topic">{item.letter}</td>
                {#each game.players as player}
                    <td>{item.scores
                        .filter(x => x.player == player)
                        .map(x => x.score)}</td>
                {/each}
                </tr>
            {/each}
            </tbody>
            <tfoot>
                <tr>
                    <td>Totals:</td>
                    {#each game.players as player}
                        <td>{scores.reduce((r,x)=>{ 
                            return r + x.scores.filter(x => x.player == player)[0].score
                        }, 0)}</td>
                    {/each}
                </tr>
            </tfoot>
        </table>
</div>

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