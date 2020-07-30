<script>
    export let game_id, player;
    let game = null;
    
    function isNullOrWhitespace(str) {
        return str == undefined || str == null || str == ""
    }
    function handleClick() {
		game = "asd";
    }
</script>

<main>
    {#if game == null && isNullOrWhitespace(game_id)}
        <p>Invalid game id</p>
    {:else if game == null && !isNullOrWhitespace(game_id)}
        <h1>Welcome to the game {game_id}!</h1>
        <p>please sign in.</p>
        <input type="text" bind:value={player} placeholder="enter your name">
        <button on:click={handleClick}>join game</button>
    {:else}
        <h1>Hello {player}, welcome to the game {game_id}!</h1>
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