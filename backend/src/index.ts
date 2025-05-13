import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import urlRoutes from "./routes/url.route";
import './utils/mongoDb-connect';

const passport = require("passport");
const session = require("express-session");

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

app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);
app.use(cookieParser());

app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      sameSite: "lax",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.listen(process.env.PORT, () => {
  console.log(
    "\x1b[32m[SERVER]\x1b[0m" +
      "\x1b[33m Server Started On Port \x1b[0m" +
      `\x1b[32m ${process.env.PORT} \x1b[0m`
  );
});

urlRoutes(app);
authRoutes(app);

