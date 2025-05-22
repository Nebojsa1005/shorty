"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const url_route_1 = __importDefault(require("./routes/url.route"));
require("./utils/mongoDb-connect");
const path_1 = __importDefault(require("path"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const env = process.env.NODE_ENV || 'development';
const envPath = path_1.default.resolve(process.cwd(), `.env${env === 'development' ? '' : '.' + env}`);
dotenv_1.default.config({ path: envPath });
mongoose_1.default.connect(`${process.env.MONGO_DB_URL}`);
mongoose_1.default.connection.once("open", () => {
    console.log("\x1b[32m[MongoDB]\x1b[0m" +
        "\x1b[33m Successfully connected to database \x1b[0m");
});
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: false }));
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_DB_URL,
        collectionName: 'sessions',
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true only in production
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get('/', (req, res) => {
    res.send('caos');
});
app.listen(process.env.PORT, () => {
    console.log("\x1b[32m[SERVER]\x1b[0m" +
        "\x1b[33m Server Started On Port \x1b[0m" +
        `\x1b[32m ${process.env.PORT} \x1b[0m`);
});
(0, url_route_1.default)(app);
(0, auth_routes_1.default)(app);
