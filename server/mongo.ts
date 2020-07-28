// import { MongoClient } from "https://deno.land/x/mongo@v0.8.0/mod.ts";

// export function mongo(uri: string) {
//   const client = new MongoClient();
//   client.connectWithUri(uri);

//   return client.database("contact-network");
// }

export async function getUser(db: any, email: string) {
    // return await db.collection("users").findOne({email: email})
}

export async function getUsers(db: any) {
    return await db.collection("users").find({})
}

export async function getProfile(db: any, id: string) {
  const user = await db.collection("users").findOne({ "profiles.id": id})
  return user.profiles.find((x:any) => { return x.id == id })
}

export async function makeFriendRequest(db: any, id: string) {
  const user = await db.collection("requests").findOne({ "profiles.id": id})
  return user.profiles.find((x:any) => { return x.id == id })
}

export async function getRequests(db: any, id: string) {
  
  const user = await db.collection("requests").find({ "friend_id": id})
  return user.profiles.find((x:any) => { return x.id == id })
}

export async function acceptRequest(db: any, requestid: string) {
  const user = await db.collection("requests").findOne({ "profiles.id": id})
  return user.profiles.find((x:any) => { return x.id == id })
}

// // insert
// const insertId = await users.insertOne({
//   username: "user1",
//   password: "pass1",
// });

// // insertMany
// const insertIds = await users.insertMany([
//   {
//     username: "user1",
//     password: "pass1",
//   },
//   {
//     username: "user2",
//     password: "pass2",
//   },
// ]);

// // findOne
// const user1 = await users.findOne({ _id: insertId });
// console.log(user1);

// // find
// const all_users = await users.find({ username: { $ne: null } });
// console.log(all_users);

// // count
// const count = await users.count({ username: { $ne: null } });
// console.log(count);

// // aggregation
// const docs = await users.aggregate([
//   { $match: { username: "many" } },
//   { $group: { _id: "$username", total: { $sum: 1 } } },
// ]);
// console.log(docs);

// // updateMany
// const { matchedCount, modifiedCount, upsertedId } = await users.updateMany(
//   { username: { $ne: null } },
//   { $set: { username: "USERNAME" } },
// );z

// // deleteOne
// const deleteCount = await users.deleteOne({ _id: insertId });

// // deleteMany
// const deleteCount2 = await users.deleteMany({ username: "USERNAME" });
