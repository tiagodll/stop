<script lang="ts">
    import { isNullOrWhitespace, letter, calculateScore, Status, 
        NEW_GAME, WAITING_TO_START, GAME_ENDED, ROUND_ACTIVE, ROUND_ENDED } from './helpers.js';
    import Scoreboard from './components/Scoreboard.svelte';
    import RoundResults from './components/RoundResults.svelte';
import { onMount } from 'svelte';

    export let game_id, player;
    let game = null, topics=[], players=[], selected_topic="", round=[], scores=[], poller = null, reloading=false;;
    let suggested = [
        "Animal",
        "Bands",
        "Color",
        "Company",
        "Country / State / City", 
        "Gadget",
        "Food",
        "Movie",
        "Super hero / villain",
        "Video game",
    ]

    if(!isNullOrWhitespace(localStorage.getItem("player")))
        player = localStorage.getItem("player");

    if(!isNullOrWhitespace(localStorage.getItem("game_id"))){
        game_id = localStorage.getItem("game_id");
        loadGame(game_id)
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
    function enterKeyTopic(event){
        enterKey(event, newTopicClicked);
    }
    function enterKey(event, func){
        if(event.keyCode == 13) 
            func();
    }
    function removeItemClicked(elem){
        topics = topics.filter(e => e !== elem.target.textContent);
        return false;
    }
    function addSuggestedItemClicked(elem){
        console.log(elem.target.textContent)
        suggested = suggested.filter(x => x != elem.target.textContent);
        topics = topics.concat(elem.target.textContent);
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
            document.location.href = `${SERVER}/play?game_id=${game.id}`;
            // poller = setInterval(() => { 
            //     reloading=true; 
            //     console.log("reloading..."); 
            //     loadGame(game_id); 
            //     reloading=true; }, 1000);
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




    onMount(async () => {
        document.getElementById("selected_topic").focus();
    });

</script>

<main>
    <i class="nes-logo" visible:active={reloading} style="position: absolute; visibility: hidden; top: 20px; left: 20px"></i>
    {#if Status(game) == NEW_GAME}
        <h1 class="nes-text is-primary">Create new game</h1>
        <div class="nes-field is-inline">
            <label for="name_field">Player</label>
            <input class="nes-input" id="host_player_name" type="text" bind:value={player} placeholder="enter your name">
        </div>
        
        <br>

        <div class="nes-field is-inline">
            <label for="name_field">Topic</label>
            <input class="nes-input" id="selected_topic" type="text" bind:value={selected_topic} on:keypress={enterKeyTopic} placeholder="topic">
            <button class="nes-btn is-primary" on:click={newTopicClicked}>add topic</button>
        </div>

        <hr>
        <h3>Selected topics:</h3>
        <ul>
            {#each topics as topic }
                <li on:click={removeItemClicked}>{topic}</li>
            {/each}
        </ul>

        <hr>
        <h3>suggestions</h3>
        <ul>
            {#each suggested as topic }
                <li on:click={addSuggestedItemClicked}>{topic}</li>
            {/each}
        </ul>

        <div class="to-right">
            <button class="nes-btn" class:is-success="{topics.length>1}" disabled={topics.length<2} on:click={startGameClicked}>start game</button>
        </div>
        
    {:else}
        <h1 class="nes-text is-primary">You still have the game {game} running</h1>
        <div class="to-right">
            <button class="nes-btn is-error" on:click={deleteGameClicked}>quit game</button>
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
    .nes-table.is-host td.answer:hover{
        background-color: maroon;
    }
    .nes-table.is-host td.answer:hover .i{
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