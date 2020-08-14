export function isNullOrWhitespace(str) {
    return str == undefined || str == null || str == ""
}

export function letter(game){
    if(game.letter.indexOf("_") < 0)
        return game.letter;
    else
        return game.letter.substring(0, game.letter.indexOf("_"))
}


export const NEW_GAME = "new game";
export const WAITING_TO_START="waiting to start";
export const GAME_ENDED = "game ended";
export const ROUND_ACTIVE = "round active";
export const ROUND_ENDED = "round ended";

export function Status(game) {
    if(game == null)
        return NEW_GAME;

    if(isNullOrWhitespace(game.letter))
        return WAITING_TO_START;
    
    if(game.letter == "$")
        return GAME_ENDED;
    
    if(game.letter.indexOf("_") < 0)
        return ROUND_ACTIVE;
    
    return ROUND_ENDED;
}

export function calculateScore(player, round) {
    let pi = round.findIndex(x => x.player == player);

    return round[pi].answers.reduce((r, x, i) => {
        if(isNullOrWhitespace(x))
            return r;

        let l = x[0].toUpperCase();
        if(l == round[pi].letter)
            return r + (isAnswerUnique(player, x, round, i) ? 2 : 1);
        if(l == "_")
            return r - 1;
        
        return r;
    }, 0);
}

function isAnswerUnique(player, answer, round, i){
    return round.some(x => x.player != player && x.answers[i] == answer)
}