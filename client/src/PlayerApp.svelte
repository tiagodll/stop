<script>
    import { isNullOrWhitespace, letter, calculateScore, Status, 
        NEW_GAME, WAITING_TO_START, GAME_ENDED, ROUND_ACTIVE, ROUND_ENDED } from './helpers.js';
    import Scoreboard from './components/Scoreboard.svelte';
    import RoundResults from './components/RoundResults.svelte';
	
    export let game_id, player;
    let game = null, answers=[], round=[], scores=[], poller = null;
    let answersTimeout, reloading=false;

    var searchParams = new URLSearchParams(document.URL.substr(document.URL.indexOf("?")));
	game_id = searchParams.get("game_id");

	if(!isNullOrWhitespace(localStorage.getItem("player")))
		player = localStorage.getItem("player");
	
	if(game_id == localStorage.getItem("game_id")){
        loadGame(game_id);
        startPolling(game_id);
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
                answers = game.topics.map(_ => "")
                if(game.letter == "$" || game.letter.indexOf("_") > 0){
                    loadRound(game);
                }
            }
        })
        .catch((error) => { console.error('Error:', error) });
    }

    function startPolling(game_id){
        poller = setInterval(() => {
            let status = Status(game);
            if(status == WAITING_TO_START 
            || status == GAME_ENDED 
            || status == ROUND_ACTIVE 
            || status == ROUND_ENDED){
                fetch(`${SERVER}/api/game/${game_id}?player=${player}`)
                .then((r) => r.json())
                .then((result) => {
                    if(status == ROUND_ACTIVE){
                        if(game.letter != result.letter){
                            game = result;
                            loadRound(game);
                        }
                    }else{
                        game = result;
                        if(status == ROUND_ENDED)
                            loadRound(game);
                    }
                })
                .catch((error) => { console.error('Error:', error) });
            }
        }, 1000);
    }

    function joinGameClicked() {
        fetch(`${SERVER}/api/game/${game_id}/join?player=${player}`)
        .then((r) => r.json())
        .then((result) => {
            game = result;
            localStorage.setItem("game_id", game.id);
            localStorage.setItem("player", player);
            answers = game.topics.map(_ => "")
            
            poller = setInterval(() => { 
                reloading=true; 
                console.log("reloading..."); 
                loadGame(game_id); 
                reloading=true; }, 2000);
            //clearInterval(poller);
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
                scores = [];
                round.forEach(r => {
                    if(scores.findIndex(x => x.letter == r.letter) < 0)
                        scores.push({ letter: r.letter, scores: [] });
                    
                    let i = scores.findIndex(x => x.letter == r.letter);
                    scores[i].scores.push({
                        player: r.player,
                        score: r.score
                    }); 
                });
            }else{
                for (let i = 0; i < round.length; i++) {
                    round[i].score = calculateScore(round[i].player, round);
                }
            }
        })
        .catch((error) => { console.error('Error:', error); return null });
    }

    function saveAnswers(i, data) {

        //answers = document.querySelectorAll(".nes-input.answer").map(x => x.value)
        answers = []
        document.querySelectorAll(".nes-input.answer").forEach(x => {
            answers.push(x.value);
        })

        answers[i] = data;
        console.log(answers.join("|"))

        clearTimeout(answersTimeout); 
        
        answersTimeout = setTimeout(()=>{
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
        }, 2000);
    }

</script>

<main>
    <i class="nes-logo" visible:active={reloading} style="position: absolute; visibility: hidden; top: 20px; left: 20px"></i>
    {#if Status(game) == NEW_GAME}
        <!-- <h1>Invalid game id</h1> -->
    <!-- {:else if game == null} -->
        <h1 class="nes-text is-primary">Welcome to the game {game_id}!</h1>
        <p>please sign in.</p>
        <input class="nes-input" type="text" bind:value={player} placeholder="enter your name">
        <div class="to-right"><button class="nes-btn is-primary" on:click={joinGameClicked}>join game</button></div>
        

    {:else if Status(game) == WAITING_TO_START}
        <h1 class="nes-text is-primary">Hello {player}, welcome to the game {game.id}!</h1>
        <p>Waiting round to start</p>
        <p>Current players:</p>
        <ul>
            {#each game.players as player }
                <li>{player}</li>
            {/each}
        </ul>

    {:else if Status(game) == GAME_ENDED}
        <h1 class="nes-text is-primary">Game {game.id} ended.</h1>
        <Scoreboard game={game} scores={scores}></Scoreboard>
        
	{:else if Status(game) == ROUND_ACTIVE}
        <h1 class="nes-text is-primary">Round {game.letter}</h1>
        <p>topics:</p>
        {#each answers as answer, i }
        <div class="nes-field is-inline">
            <label for="name_field">{game.topics[i]}</label>
            <input class="nes-input answer" type="text" on:input={(e) => saveAnswers(i, e.target.value)} />
        </div>
        {/each}
        <br>
        <div class="to-right">
            <button class="nes-btn is-primary" on:click={finishRoundClicked}>finished</button>
        </div>

    {:else} <!-- ROUND ENDED -->
        <h1 class="nes-text is-primary">Round {letter(game)} finished</h1>
        <br>
        <p>Round results:</p>
        <br>
        <RoundResults game={game} round={round} isHost={false}></RoundResults>
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

    .visible{
        visibility: visible;
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