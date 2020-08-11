<script>
	import { isNullOrWhitespace } from './helpers.js';
	
    export let game_id, player;
    let game = null, answers=[];

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
            }
        })
        .catch((error) => { console.error('Error:', error) });
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
        .then((result) => { game = result })
        .catch((error) => { console.error('Error:', error) });
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
        <h1>Welcome to the game {game_id}!</h1>
        <p>please sign in.</p>
        <input type="text" bind:value={player} placeholder="enter your name">
        <button on:click={joinGameClicked}>join game</button>
    {:else if game != null && isNullOrWhitespace(game.letter)}
        <h1>Hello {player}, welcome to the game {game.id}!</h1>
        <p>Waiting round to start</p>
        <p>Current players:</p>
        <ul>
            {#each game.players as player }
                <li>{player}</li>
            {/each}
        </ul>
	{:else if game.letter.indexOf("_") < 0}
		<h1>Round {game.letter}</h1>
		<p>topics:</p>
		<ul>
			{#each answers as answer, i }
			<li>
				{game.topics[i]}
				<input type="text" on:change={(e) => saveAnswers(i, e.target.value)} />
				'{answers[i]}'
			</li>
			{/each}
		</ul>
        <button on:click={finishRoundClicked}>finished</button>
	{:else}
		<h1>Round {game.letter} finished</h1>
		?
    {/if}

    <ul id="events"></ul>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 2em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>