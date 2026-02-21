import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import urlRoutes from "./routes/url.route";
import authRoutes from "./routes/auth.routes";
import "./utils/mongoDb-connect";
import path from "path";
import MongoStore from "connect-mongo";
import passport from "passport";
import session from "express-session";
import pricingRoutes from "./routes/pricing";
import analyticsRoutes from "./routes/analytics.route";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { startLinkExpirationCron } from "./services/link-expiration-cron";

const app = express();
app.set("trust proxy", true);
const env = process.env.NODE_ENV || "development";

const allowedOrigins = [
  "http://localhost:4200",
  "https://minylinks.netlify.app",
  "https://accounts.google.com"
];

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by Socket.IO CORS"));
      }
    },
    credentials: true,
  },
});

// Socket.IO setup
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    socket.emit('room-joined', { roomId, socketId: socket.id });

  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const envPath = path.resolve(
  process.cwd(),
  `.env${env === "development" ? "" : "." + env}`
);

dotenv.config({ path: envPath });

// mongoose.connect(`${process.env.MONGO_DB_URL}`);
mongoose.connection.once("open", () => {
  console.log(
    "\x1b[32m[MongoDB]\x1b[0m" +
      "\x1b[33m Successfully connected to database \x1b[0m"
  );
});

app.use(bodyParser.json({
  limit: "50mb",
  verify: (req, _res, buf) => { (req as any).rawBody = buf; }
}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));


app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URL,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("caooooo");
});

urlRoutes(app);
authRoutes(app);
pricingRoutes(app, io);
analyticsRoutes(app);

startLinkExpirationCron(io);

server.listen(process.env.PORT || "3000", () => {
  console.log(
    "\x1b[32m[SERVER]\x1b[0m" +
      "\x1b[33m Server Started On Port \x1b[0m" +
      `\x1b[32m ${process.env.PORT} \x1b[0m`
  );
});
