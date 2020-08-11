<svelte:options immutable/>

<script>
    export let game_id, player;
    let game = null, topics=[], players=[], answers=[], selected_topic="";

    var searchParams = new URLSearchParams(document.URL.substr(document.URL.indexOf("?")));
    game_id = searchParams.get("game_id");

    if(!isNullOrWhitespace(localStorage.getItem("player"))){
        player = localStorage.getItem("player");
        fetch(`${SERVER}/api/game/${game_id}?player=${player}`)
        .then((r) => r.json())
        .then((result) => {
            if(result == null || isNullOrWhitespace(result.id))
                game = null;
            else
                game = result;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    
    function isNullOrWhitespace(str) {
        return str == undefined || str == null || str == ""
    }
    function joinGameClicked() {
        let res = fetch(`${SERVER}/api/game/${game_id}/join`, {
            method: 'POST',
            body: JSON.stringify({ player: player })
        })
        .then((r) => r.json())
        .then((result) => {
            game = result;
            localStorage.setItem("game_id", game.id);
            localStorage.setItem("player", player);
        })
        .catch((error) => {
            console.error('Error:', error);
        });


    }
    function newTopicClicked() {
        if(isNullOrWhitespace(selected_topic)){
            document.getElementById("selected_topic").focus();
            return false;
        }

        // duplicate topics make no sense in the game
        if(topics.find(e => e == selected_topic) != null){
            document.getElementById("selected_topic").focus();
            return false;
        }
        
        topics = topics.concat(selected_topic);
        selected_topic = "";
        document.getElementById("selected_topic").focus();
    }
    function startGameClicked() {
        let res = fetch(`${SERVER}/api/create_game`, {
            method: 'POST',
            body: JSON.stringify({
                player: player,
                topics: topics,
            })
        })
        .then((r) => r.json())
        .then((result) => {
            game = result;
            game_id = game.id;
            localStorage.setItem("game_id", game.id);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

</script>

<main>
    {#if game == null && isNullOrWhitespace(game_id)}
        <h1>Invalid game id</h1>
    {:else if game == null && !isNullOrWhitespace(game_id)}
        <h1>Welcome to the game {game_id}!</h1>
        <p>please sign in.</p>
        <input type="text" bind:value={player} placeholder="enter your name">
        <button on:click={joinGameClicked}>join game</button>
    {:else if game != null && isNullOrWhitespace(game.letter)}
        <h1>Hello {player}, welcome to the game {game.id}!</h1>
        <p>Waiting round to start</p>
        <p>Current players:</p>
        <ul>
            {#each players as player }
                <li>{player}</li>
            {/each}
        </ul>
    {:else}
        <h1>Round {game.letter}</h1>
        <p>Current players:</p>
        <ul>
            {#each topics as topic }
                <li>
                    {topic}
                    <input type="text" bind:value={topic} />
                </li>
            {/each}
        </ul>
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