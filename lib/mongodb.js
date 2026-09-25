import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn("MONGODB_URI is not set. View-once API routes will fail until it is configured.");
}

/** @type {MongoClient | null} */
let client = null;
/** @type {Promise<MongoClient> | null} */
let clientPromise = null;

export function getClient() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = globalThis;
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export const VIEW_DOC_ID = "birthday-view";

export async function getViewCollection() {
  const mongo = await getClient();
  return mongo.db().collection("site_state");
}
