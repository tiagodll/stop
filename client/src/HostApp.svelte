<svelte:options immutable/>

<script>
    export let game_id, player;
    let game = null, topics=[], selected_topic="";
    
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
        let res = fetch('http://localhost:3000/api/create_game', {
            method: 'POST',
            body: JSON.stringify({
                player: player,
                topics: topics,
            })
        })
        .then((r) => r.json())
        .then((result) => {
            console.log('Success:', result);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // const socket = new EventSource("/sse");
    // socket.addEventListener("ping", (evt) => {
    //     console.log(evt.data);
    // });


    // onMount(async () => {
    //     player = "xxxx"
	// 	// const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
	// 	// photos = await res.json();
	// });

</script>

<main>
    {#if game == null && isNullOrWhitespace(game_id)}
        <h1>Create new game</h1>
        <input id="host_player_name" autofocus type="text" bind:value={player} placeholder="enter your name">
        <br>
        <input id="selected_topic" type="text" bind:value={selected_topic} placeholder="enter your name">
        <button on:click={newTopicClicked}>add topic</button>
        <ul>
            {#each topics as topic }
                <li>{topic}</li>
            {/each}
        </ul>
        <button disabled={topics.length<2} on:click={startGameClicked}>start game</button>
    {:else if game == null && !isNullOrWhitespace(game_id)}
        <h1>Welcome to the game {game_id}!</h1>
        <p>please sign in.</p>
        <input type="text" bind:value={player} placeholder="enter your name">
        <button on:click={joinGameClicked}>join game</button>
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