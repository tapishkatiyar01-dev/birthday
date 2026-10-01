import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn("MONGODB_URI is not set. View-once API routes will fail until it is configured.");
}

const options = {
  maxPoolSize: 5,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 4000,
  connectTimeoutMS: 4000,
  socketTimeoutMS: 8000,
};

const globalWithMongo = globalThis;

export function getClient() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  return globalWithMongo._mongoClientPromise;
}

export const VIEW_DOC_ID = "birthday-view";

export async function getViewCollection() {
  const mongo = await getClient();
  return mongo.db().collection("site_state");
}
