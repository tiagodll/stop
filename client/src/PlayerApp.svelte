<script>
    export let game_id, player;
    
    function isNullOrWhitespace(str) {
        return str == undefined || str == null || str == ""
    }
</script>

<main>
    {#if isNullOrWhitespace(game_id)}
        <p>Invalid game id</p>
    {:else if !isNullOrWhitespace(game_id) && isNullOrWhitespace(player)}
        <h1>Welcome to the game {game_id}!</h1>
        <p>please sign in.</p>
        <input type="text"><button>join game</button>
    {:else}
        <h1>Hello {player}, welcome to the game {game_id}!</h1>
        <ul>
            <li onclick=""></li>
        </ul>
    {/if}
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