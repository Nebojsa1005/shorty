import dotenv from "dotenv";
import express from "express";
import { connect } from "mongoose";
import path from "path";

const env = process.env.NODE_ENV || "development";
const envPath = path.resolve(
  process.cwd(),
  `.env${env === "development" ? "" : "." + env}`
);

dotenv.config({ path: envPath });

async function run() {
  try {
    await connect(process.env.MONGO_DB_URL);
    console.log("Connected to Database");
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.log('error', error);
    
  }
}
run().catch(console.dir);