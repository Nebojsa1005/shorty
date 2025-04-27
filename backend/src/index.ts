import * as dotenv from "dotenv"
import express from "express";
import mongoose from "mongoose";
import urlRoutes from "./routes/url.route";
import bodyParser from "body-parser";

const app = express();

dotenv.config();

mongoose.connect(`${process.env.MONGO_DB_URL}`);
mongoose.connection.once("open", () => {
  console.log(
    "\x1b[32m[MongoDB]\x1b[0m" +
      "\x1b[33m Successfully connected to database \x1b[0m"
  );
});


app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));


app.use((req, res, next) => {
  res.setHeader("Content-type", "application/json");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("caos");
});

app.listen(process.env.PORT, () => {
  console.log(
    "\x1b[32m[SERVER]\x1b[0m" +
      "\x1b[33m Server Started On Port \x1b[0m" +
      `\x1b[32m ${process.env.PORT} \x1b[0m`
  );
});

urlRoutes(app)
