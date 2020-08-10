import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import "https://deno.land/x/dotenv/load.ts";
import { IGame, IRound } from "./interfaces.ts";

const db = new DB(Deno.env.get("CONNECTION_STRING"));

export default db;

export async function create(connection_string: string) {
  db.query(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT,
        password TEXT,
        players TEXT,
        topics TEXT,
        letter TEXT,
        timestamp DATETIME,
        PRIMARY KEY (id)
      )`);
  // db.query(`
  //     CREATE TABLE IF NOT EXISTS players (
  //       game_id TEXT,
  //       name TEXT
  //     )`);
  db.query(`
      CREATE TABLE IF NOT EXISTS rounds (
        game_id TEXT,
        letter TEXT,
        player TEXT,
        answers TEXT,
        score INTEGER,
        PRIMARY KEY (game_id, letter, player)
      )`);


  saveGame({id: "asd", password: "qwe", players: ["tiago","berta"], topics: ["topic1","topic2","topic3"], letter: "a"});
  savePlayerRound({game_id:"asd", letter: "a", player: "tiago", answers: "asd|aqwe|azxc", score: 5});
}

export async function saveGame(game:IGame) {
  console.log("saveGame");
  console.log(game)
  return await db.query(
    `INSERT OR REPLACE INTO games (id, password, players, topics, letter, timestamp) VALUES (?, ?, ?, ?, ?, date('now'))`,
    [game.id, game.password, game.players.join("|"), game.topics.join("|"), game.letter],
  );
}

export async function fetchGame(game_id: string) : IGame {
  console.log("fetchGame", game_id);
  const rows = [
    ...db.query("SELECT * FROM games WHERE id=?", [game_id]).asObjects(),
  ];
  console.log(rows);
  return rows;
}

export async function savePlayerRound(round:IRound) {
  console.log("savePlayerRound");
  console.log(round);
  return await db.query(
    `INSERT OR REPLACE INTO rounds (game_id, letter, player, answers, score) VALUES (?, ?, ?, ?, ?)`,
    [round.game_id, round.letter, round.player, round.answers, round.score],
  );
}

export async function fetchRound(id: string, letter: string) {
  console.log("fetchRound", id);
  const rows = [
    ...db.query("SELECT * FROM rounds WHERE game_id=? AND letter=?", [id, letter]).asObjects(),
  ];
  console.log(rows);
  return rows;
}