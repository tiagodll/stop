<svelte:options immutable/>

<script>
    export let game_id, player;
    let game = null, topics=[], players=[], selected_topic="";

    if(!isNullOrWhitespace(localStorage.getItem("player")))
        player = localStorage.getItem("player");

    if(!isNullOrWhitespace(localStorage.getItem("game_id"))){
        game_id = localStorage.getItem("game_id");

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
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    
    function isNullOrWhitespace(str) {
        return str == undefined || str == null || str == ""
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
                players: [player],
                topics: topics,
            })
        })
        .then((r) => r.json())
        .then((result) => {
            game = result;
            game_id = game.id;
            localStorage.setItem("game_id", game.id);
            localStorage.setItem("player", player);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    
    // const sse = new EventSource(`${SERVER}/sse/1234567`);//, { withCredentials: true });
    // sse.onmessage = (evt) => {
    //     const li = document.createElement("li");
    //     li.textContent = `message: ${evt.data}`;
    //     document.getElementById("events").appendChild(li);
    // };

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
    {#if game == null}
        <h1>Create new game</h1>
        <input id="host_player_name" type="text" bind:value={player} placeholder="enter your name">
        <br>
        <input id="selected_topic" type="text" bind:value={selected_topic} placeholder="topic">
        <button on:click={newTopicClicked}>add topic</button>
        <ul>
            {#each topics as topic }
                <li>{topic}</li>
            {/each}
        </ul>
        <button disabled={topics.length<2} on:click={startGameClicked}>start game</button>
    {:else}
        <h1>Hello {player}, welcome to the game {game.id}!</h1>
        <a href="http://localhost:3000/play?game_id={game.id}">http://localhost:3000/play?game_id={game.id}</a>
        <p>Current players:</p>
        <ul>
            {#each game.players as player }
                <li>{player}</li>
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