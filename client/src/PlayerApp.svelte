<script>
	import { isNullOrWhitespace } from './helpers.js';
	
    export let game_id, player;
    let game = null, answers=[], round=[], scoreboard=[];

    var searchParams = new URLSearchParams(document.URL.substr(document.URL.indexOf("?")));
	game_id = searchParams.get("game_id");

	if(!isNullOrWhitespace(localStorage.getItem("player")))
		player = localStorage.getItem("player");
	
	if(!isNullOrWhitespace(localStorage.getItem("game_id")) && game_id == localStorage.getItem("game_id")){
		console.log(`fetch: ${SERVER}/api/game/${game_id}?player=${player}`)
        fetch(`${SERVER}/api/game/${game_id}?player=${player}`)
        .then((r) => r.json())
        .then((result) => {
            console.log(result)
            if(result == null || isNullOrWhitespace(result.id)){
                localStorage.removeItem("game_id");
                game_id = null;
				game = null;
            }
            else{
                game = result;
                answers = game.topics.map(_ => "")
                if(game.letter == "$" || game.letter.indexOf("_") > 0){
                    loadRound(game);
                }
            }
        })
        .catch((error) => { console.error('Error:', error) });
	}

    function letter(game){
        if(game.letter.indexOf("_") < 0)
            return game.letter;
        else
            return game.letter.substring(0, game.letter.indexOf("_"))
    }

    function joinGameClicked() {
        fetch(`${SERVER}/api/game/${game_id}/join?player=${player}`)
        .then((r) => r.json())
        .then((result) => {
            game = result;
            localStorage.setItem("game_id", game.id);
            localStorage.setItem("player", player);
			answers = game.topics.map(_ => "")
        })
        .catch((error) => { console.error('Error:', error) });
    }
    function finishRoundClicked() {
        fetch(`${SERVER}/api/game/${game_id}/finish-round?player=${player}`)
        .then((r) => r.json())
        .then((result) => { 
            game = result;
            loadRound(game);
         })
        .catch((error) => { console.error('Error:', error) });
    }
    function loadRound(game) {
        fetch(`${SERVER}/api/game/${game_id}/round/${letter(game)}`)
        .then((r) => r.json())
        .then((result) => { 
            round = result
            if(game.letter == "$"){
                scoreboard = [];
                round.forEach(r => {
                    if(scoreboard.findIndex(x => x.letter == r.letter) < 0)
                        scoreboard.push({ letter: r.letter, scores: [] });
                    
                    let i = scoreboard.findIndex(x => x.letter == r.letter);
                    scoreboard[i].scores.push({
                        player: r.player,
                        score: r.score
                    }); 
                });
            }else{
                for (let i = 0; i < round.length; i++) {
                    round[i].score = calculateScore(round[i].player);
                }
            }
        })
        .catch((error) => { console.error('Error:', error); return null });
    }
    function calculateScore(player) {
        let pi = round.findIndex(x => x.player == player);
        
        return round[pi].answers.reduce((r, x) => {
            if(isNullOrWhitespace(x))
                return r;

            let l = x[0].toUpperCase();
            if(l == letter(game))
                return r + 1;
            if(l == "_")
                return r - 1;
            
            return r;
        }, 0);
    }

    function saveAnswers(i, data) {
		answers[i] = data;

        fetch(`${SERVER}/api/game/${game_id}/save-answers`, {
            method: 'POST',
            body: JSON.stringify({
				game_id: game.id,
				letter: game.letter,
                player: player,
				answers: answers,
				score: 0
            })
        })
        .then((r) => r.json())
        .then((result) => { console.log(result) })
        .catch((error) => { console.error('Error:', error) });
    }

</script>

<main>
    {#if game == null}
        <!-- <h1>Invalid game id</h1> -->
    <!-- {:else if game == null} -->
        <h1 class="nes-text is-primary">Welcome to the game {game_id}!</h1>
        <p>please sign in.</p>
        <input class="nes-input" type="text" bind:value={player} placeholder="enter your name">
        <button class="nes-btn is-primary" on:click={joinGameClicked}>join game</button>
    {:else if game != null && isNullOrWhitespace(game.letter)}
        <h1 class="nes-text is-primary">Hello {player}, welcome to the game {game.id}!</h1>
        <p>Waiting round to start</p>
        <p>Current players:</p>
        <ul>
            {#each game.players as player }
                <li>{player}</li>
            {/each}
        </ul>
    {:else if game.letter == "$"}
        <h1 class="nes-text is-primary">Game {game.id} ended.</h1>
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
            {#each scoreboard as item}
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
                        <td>{scoreboard.reduce((r,x)=>{ 
                            return r + x.scores.filter(x => x.player == player)[0].score
                        }, 0)}</td>
                    {/each}
                </tr>
            </tfoot>
        </table>
        
	{:else if game.letter.indexOf("_") < 0}
        <h1 class="nes-text is-primary">Round {game.letter}</h1>
        <p>topics:</p>
        {#each answers as answer, i }
        <div class="nes-field is-inline">
            <label for="name_field">{game.topics[i]}</label>
            <input class="nes-input" type="text" on:change={(e) => saveAnswers(i, e.target.value)} />
        </div>
        {/each}
        <br>
        <div class="to-right"><button class="nes-btn is-primary" on:click={finishRoundClicked}>finished</button></div>
    {:else}
        <h1 class="nes-text is-primary">Round {letter(game)} finished</h1>
        <br>
        <p>Round results:</p>
        <br>
		<table class="nes-table is-bordered is-justified">
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
                        <td class="answer">
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
    {/if}

    <ul id="events"></ul>
</main>

<style>
	main {
		max-width: 800px;
		margin: 5% auto;
    }
    .to-right{ 
        text-align: right;
    }
    .is-justified{
        width: 100%;
        /* border-collapse:collapse; */
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


	/* @media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>