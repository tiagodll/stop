<script>
    import { isNullOrWhitespace } from './helpers.js';

    export let game_id, player;
    let game = null, topics=[], players=[], selected_topic="", round=[], scoreboard=[], poller = null, reloading=false;;

    if(!isNullOrWhitespace(localStorage.getItem("player")))
        player = localStorage.getItem("player");

    if(!isNullOrWhitespace(localStorage.getItem("game_id"))){
        game_id = localStorage.getItem("game_id");
        loadGame(game_id)
    }

    function letter(game){
        if(game.letter.indexOf("_") < 0)
            return game.letter;
        else
            return game.letter.substring(0, game.letter.indexOf("_"))
    }

    function loadGame(game_id) {
        fetch(`${SERVER}/api/game/${game_id}?player=${player}`)
        .then((r) => r.json())
        .then((result) => {
            if(result == null || isNullOrWhitespace(result.id)){
                localStorage.removeItem("game_id");
                game_id = null;
                game = null;
            }
            else{
                game = result;
                if(game.letter != null && (game.letter == "$" || game.letter.indexOf("_") > 0)){
                    loadRound(game);
                }
            }
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
        fetch(`${SERVER}/api/create-game`, {
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
            poller = setInterval(() => { 
                reloading=true; 
                console.log("reloading..."); 
                loadGame(game_id); 
                reloading=true; }, 1000);
        })
        .catch((error) => { console.error('Error:', error) });
    }

    function nextRoundClicked() {
        fetch(`${SERVER}/api/game/${game.id}/next-round`, {
            method: 'POST',
            body: JSON.stringify(round)
        })
        .then((r) => r.json())
        .then((result) => {
            game = result;
            game_id = game.id;
            localStorage.setItem("game_id", game.id);
            localStorage.setItem("player", player);
        })
        .catch((error) => { console.error('Error:', error) });
    }
    function endGameClicked(){
        fetch(`${SERVER}/api/game/${game.id}/end-game`, {
            method: 'POST',
            body: JSON.stringify(round)
        })
        .then((r) => r.json())
        .then((result) => {
            game = result;
            loadRound(game);
        })
        .catch((error) => { console.error('Error:', error) });
    }
    function deleteGameClicked() {
        fetch(`${SERVER}/api/game/${game.id}`, {
            method: 'DELETE',
            body: ""
        })
        .then((r) => r.json())
        .then((result) => {
            document.location.href = "/"
        })
        .catch((error) => { console.error('Error:', error) });
    }

    function markAnswer(player, topic) {
        let pi = round.findIndex(x => x.player == player);
        let ti = game.topics.findIndex(x => x == topic);

        let ans = round[pi].answers[ti];
        if(isNullOrWhitespace(ans))
            return;

        round[pi].answers[ti] = ans[0] == "_" ? ans.substr(1): "_" + ans;
        round[pi].score = calculateScore(player);
        fetch(`${SERVER}/api/game/${game_id}/save-answers`, {
            method: 'POST',
            body: JSON.stringify({
                ...round[pi]
            })
        })
        .then((r) => r.json())
        .then((result) => {            
            //game = result;
        })
        .catch((error) => { console.error('Error:', error) });
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
    <i class="nes-logo" visible:active={reloading} style="position: absolute; visibility: hidden; top: 20px; left: 20px"></i>
    {#if game == null}
        <h1 class="nes-text is-primary">Create new game</h1>
        <div class="nes-field is-inline">
            <label for="name_field">Player</label>
            <input class="nes-input" id="host_player_name" type="text" bind:value={player} placeholder="enter your name">
        </div>
        
        <br>

        <div class="nes-field is-inline">
            <label for="name_field">Topic</label>
            <input class="nes-input" id="selected_topic" type="text" bind:value={selected_topic} placeholder="topic">
            <button class="nes-btn is-primary" on:click={newTopicClicked}>add topic</button>
        </div>

        <ul>
            {#each topics as topic }
                <li>{topic}</li>
            {/each}
        </ul>
        <div class="to-right">
            <button class="nes-btn" class:is-success="{topics.length>1}" disabled={topics.length<2} on:click={startGameClicked}>start game</button>
        </div>
        
        
    {:else if game.letter==null}
        <h1 class="nes-text is-primary">Hello {player}, welcome to the game {game.id}!</h1>
        <a href="http://localhost:3000/play?game_id={game.id}">http://localhost:3000/play?game_id={game.id}</a>
        <p>Current players:</p>
        <ul>
            {#each game.players as player }
                <li>{player}</li>
            {/each}
        </ul>
        <div class="to-right">
            <button class="nes-btn is-success" on:click={nextRoundClicked}>begin round</button>
        </div>
        

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
        <br>
        <div class="to-right">
            <button class="nes-btn is-error" on:click={deleteGameClicked}>quit game</button>
        </div>
        

    {:else if game.letter.indexOf("_") < 0}
        <h1 class="nes-text is-primary">Game {game.id}, round {letter(game)}</h1>
        <a href="http://localhost:3000/play?game_id={game.id}">http://localhost:3000/play?game_id={game.id}</a>
        <br><br>
        <p>Current players:</p>
        <ul>
            {#each game.players as player }
                <li>{player}</li>
            {/each}
        </ul>
        <div class="to-right">
            <button class="nes-btn is-error" on:click={deleteGameClicked}>quit game</button>
        </div>
    {:else}
        <h1 class="nes-text is-primary">Round {letter(game)} finished</h1>
        <!-- <a href="http://localhost:3000/play?game_id={game.id}">http://localhost:3000/play?game_id={game.id}</a> -->
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
                    <td class="answer" on:click={markAnswer(item.player, game.topics[i])}>
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
        <br>
        <div class="to-right">
            <button class="nes-btn is-success" on:click={nextRoundClicked}>start next round</button>
            <button class="nes-btn is-warning" on:click={endGameClicked}>finish game</button>
        </div>
    {/if}

    <ul id="events"></ul>
</main>

<style>
	main {
		max-width: 800px;
		margin: 5% auto;
	}
    .visible{
        visibility: visible;
    }

    .to-right{ 
        text-align: right;
    }
    .is-justified{
        width: 100%;
        /* border-collapse:collapse; */
    }
    .nes-table td.unique{
        background-color: green;
    }
    .nes-table td.answer:hover{
        background-color: maroon;
    }
    .nes-table td.answer:hover .i{
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



	/* @media (min-width: 640px) {
		main {
			max-width: none;
		}
	} */
</style>