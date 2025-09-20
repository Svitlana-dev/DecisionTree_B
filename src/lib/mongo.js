import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
if (!uri || !dbName) throw new Error("Missing Mongo env vars");

let client;
let dbPromise;

export async function getDb() {
  if (!dbPromise) {
    client = new MongoClient(uri);
    dbPromise = client.connect().then((c) => c.db(dbName));
  }
  return dbPromise;
}
