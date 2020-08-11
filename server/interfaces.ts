interface IGame{
    id: string,
    password: string,
    players: Array<string>,
    topics: Array<string>,
    letter:string
}

interface IRound{
    game_id: string,
    letter:string,
    player: string,
    answers: Array<string>,
    score:number
}