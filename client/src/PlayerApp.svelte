<svelte:options immutable/>

<script>
    export let game_id, player;
    let game = null, topics=[], players=[], selected_topic="";

    var searchParams = new URLSearchParams(document.URL.substr(document.URL.indexOf("?")));
    searchParams.get("id");
    
    function isNullOrWhitespace(str) {
        return str == undefined || str == null || str == ""
    }
    function joinGameClicked() {
		game = "asd";
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
    {:else}
        <h1>Hello {player}, welcome to the game {game_id}!</h1>
        <a href="http://localhost:3000/{game_id}">http://localhost:3000/{game_id}</a>
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