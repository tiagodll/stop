import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const db = new DB(config().CONNECTION_STRING);

export default db;

export async function create(connection_string: string) {
  db.query(`
      CREATE TABLE IF NOT EXISTS games (
        id TEXT,
        password TEXT,
        player TEXT,
        topics TEXT,
        letter TEXT,
        timestamp DATETIME
      )`);
  db.query(`
      CREATE TABLE IF NOT EXISTS players (
        game_id TEXT,
        name TEXT
      )`);
  db.query(`
      CREATE TABLE IF NOT EXISTS rounds (
        game_id TEXT,
        player TEXT,
        answers TEXT,
        score INTEGER
      )`);

  createGame("asd");
}

export async function createGame(id: string) {
  return await db.query(
    `
      INSERT INTO games (id, password, player, topics, letter, timestamp)
      VALUES (?, ?, ?, ?, ?, date('now'))
    `,
    [id, "qwe", "tiago", "topic1|topic2|topic3", "a"],
  );
}

export async function fetchGame(game_id: string) {
  console.log("rows");
  const rows = [
    ...db.query("SELECT * FROM games WHERE id=?", [game_id]).asObjects(),
  ];
  console.log(rows);
  return rows;
}

export async function fetchLastRound(id: string) {
  // const db = new DB(connection_string);
  for (const arr of db.query("SELECT * FROM games WHERE id=?", [id])) {
    console.log(arr);
    return arr;
  }
  return null;
}
