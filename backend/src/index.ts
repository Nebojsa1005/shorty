import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import urlRoutes from "./routes/url.route";
import './utils/mongoDb-connect';
import path from "path";
import MongoStore from "connect-mongo";
import passport from 'passport'
import session from 'express-session'

const app = express();
const env = process.env.NODE_ENV || 'development';

const envPath = path.resolve(process.cwd(), `.env${env === 'development' ? '' : '.' + env}`);

dotenv.config({ path: envPath});

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
    origin: '*',
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URL,
      collectionName: 'sessions',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true only in production
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('caossss')
})

app.listen(process.env.PORT, () => {
  console.log(
    "\x1b[32m[SERVER]\x1b[0m" +
      "\x1b[33m Server Started On Port \x1b[0m" +
      `\x1b[32m ${process.env.PORT} \x1b[0m`
  );
});

urlRoutes(app);
authRoutes(app);

