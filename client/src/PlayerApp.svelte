<script lang="ts">
    import { isNullOrWhitespace, letter, calculateScore, Status, 
        NEW_GAME, WAITING_TO_START, GAME_ENDED, ROUND_ACTIVE, ROUND_ENDED } from './helpers.js';
    import Scoreboard from './components/Scoreboard.svelte';
    import RoundResults from './components/RoundResults.svelte';

    export let game_id, player;
    let game = null, answers=[], round=[], scores=[], poller = null, isHost=false;
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
                if(game.players[0] == player)
                    isHost = true;

                if(game.letter == null){
                    answers = game.topics.map(_ => "")
                }else if(game.letter == "$" || game.letter.indexOf("_") > 0){
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

    function handleInput(e, i){
        e.target.value = e.target.value.trimLeft();
        saveAnswers(i, e.target.value)
    }

    function saveAnswers(i, data) {

        //answers = document.querySelectorAll(".nes-input.answer").map(x => x.value)
        answers = []
        document.querySelectorAll(".nes-input.answer").forEach((x:any) => {
            answers.push(x.value);
        })

        answers[i] = data
        console.log(answers.join("|"))

        clearTimeout(answersTimeout); 
        
        answersTimeout = setTimeout((function() {
            fetch(`${SERVER}/api/game/${game_id}/save-answers`, {
            method: 'POST',
            body: JSON.stringify({
				game_id: game.id,
				letter: letter(game),
                player: player,
				answers: answers,
				score: 0
                })
            })
            .then((r) => r.json())
            .then((result) => { console.log(result) })
            .catch((error) => { console.error('Error:', error) });
        }.bind(answers)), 2000);
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
        fetch(`${SERVER}/api/game/${game.id}/delete`, {
            method: 'POST',
            body: ""
        })
        .then((r) => r.json())
        .then((result) => {
            document.location.href = "/"
        })
        .catch((error) => { console.error('Error:', error) });
    }

    function markAnswer(f) {
        let player = f.detail.player;
        let topic = f.detail.topic;
        let pi = round.findIndex(x => x.player == player);
        let ti = game.topics.findIndex(x => x == topic);

        let ans = round[pi].answers[ti];
        if(isNullOrWhitespace(ans))
            return;

        round[pi].answers[ti] = ans[0] == "_" ? ans.substr(1): "_" + ans;
        round[pi].score = calculateScore(player, round);
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
        {#if isHost}
        <p>Share this link to your friends: <a href="{SERVER}/play?game_id={game.id}">{SERVER}/play?game_id={game.id}</a></p>
        <div style="text-align: center">
            <img id="qrcode" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={SERVER}/play?game_id={game.id}" />
        </div>
        {/if}
        <p>Current players:</p>
        <ul>
            {#each game.players as player }
                <li>{player}</li>
            {/each}
        </ul>
        
        {#if isHost}
        <div class="to-right">
            <button class="nes-btn is-success" on:click={nextRoundClicked}>begin round</button>
        </div>
        {/if}

    {:else if Status(game) == GAME_ENDED}
        <h1 class="nes-text is-primary">Game {game.id} ended.</h1>
        <Scoreboard game={game} scores={scores}></Scoreboard>
        <br>
        {#if isHost}
        <div class="to-right">
            <button class="nes-btn is-error" on:click={deleteGameClicked}>quit game</button>
        </div>
        {/if}
        
	{:else if Status(game) == ROUND_ACTIVE}
        <h1 class="nes-text is-primary">Round {game.letter}</h1>
        <p>topics:</p>
        {#each answers as answer, i }
        <div class="nes-field is-inline">
            <label for="name_field">{game.topics[i]}</label>
            <input class="nes-input answer" type="text" on:input={(e) => handleInput(e, i)} />
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
        <RoundResults game={game} round={round} isHost={isHost} on:markAnswer={markAnswer}></RoundResults>
        {#if isHost}
        <div class="to-right">
            <button class="nes-btn is-success" on:click={nextRoundClicked}>start next round</button>
            <button class="nes-btn is-warning" on:click={endGameClicked}>finish game</button>
        </div>
        {/if}
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