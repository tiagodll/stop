// import { Sqlite } from "https://deno.land/x/sqlite_plugin@v0.4/src/prepared.ts";
// import { Sqlite } from "https://deno.land/x/sqlite_plugin@v0.4/src/mod.ts";
// Deno.openPlugin("./libdeno_sqlite_plugin.so");
import { DB } from "https://deno.land/x/sqlite/mod.ts";

export async function connect(connection_string: string) {
  const db = new DB(connection_string);
  //   const sqlite = new Sqlite();
  //   const db = await sqlite.connect(connection_string);
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

  createGame(db, "asd");

  return db;
}

export async function createGame(db: any, id: string) {
  return await db.query(
    `
      INSERT INTO games (id, password, player, topics, letter, timestamp)
      VALUES (?, ?, ?, ?, ?, date('now'))
    `,
    [id, "qwe", "tiago", "topic1|topic2|topic3", "a"],
  );
}

export async function fetchGame(connection_string: string, game_id: string) {
  console.log(connection_string)
  const db = new DB(connection_string);

  const rows = [
    ...db.query("SELECT * FROM games WHERE id=?", [game_id]).asObjects(),
  ];
  console.log(rows);
  return rows;
}

export async function fetchLastRound(connection_string: string, id: string) {
  const db = new DB(connection_string);
  for (const arr of db.query("SELECT * FROM games WHERE id=?", [id])) {
    console.log(arr);
    return arr;
  }
  return null;
}
