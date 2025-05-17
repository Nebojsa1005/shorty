"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const url_route_1 = __importDefault(require("./routes/url.route"));
require("./utils/mongoDb-connect");
const passport = require("passport");
const session = require("express-session");
const app = (0, express_1.default)();
dotenv.config();
mongoose_1.default.connect(`${process.env.MONGO_DB_URL}`);
mongoose_1.default.connection.once("open", () => {
    console.log("\x1b[32m[MongoDB]\x1b[0m" +
        "\x1b[33m Successfully connected to database \x1b[0m");
});
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: false }));
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: "lax",
    },
}));
app.use(passport.initialize());
app.use(passport.session());
app.listen(process.env.PORT, () => {
    console.log("\x1b[32m[SERVER]\x1b[0m" +
        "\x1b[33m Server Started On Port \x1b[0m" +
        `\x1b[32m ${process.env.PORT} \x1b[0m`);
});
(0, url_route_1.default)(app);
(0, auth_routes_1.default)(app);
