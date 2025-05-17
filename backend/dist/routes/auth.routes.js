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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const user_model_1 = require("../models/user.model");
require("../utils/auth");
const server_response_1 = require("../utils/server-response");
const auth_service_1 = require("../services/auth.service");
const bcrypt_1 = require("bcrypt");
const token_1 = require("../utils/token");
const passport = require("passport");
dotenv.config();
const authRoutes = (app) => {
    app.post("/api/auth/sign-up", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userData } = req.body;
            // If email already exists
            const isEmailInUse = yield (0, auth_service_1.getUserByEmail)(userData.email);
            if (isEmailInUse) {
                return server_response_1.ServerResponse.serverError(res, 400, "Email Is Already in Use");
            }
            // Hash candidate password
            const hashedPassword = yield (0, bcrypt_1.hash)(userData.password, 10);
            // Creating instance of Candidate
            const newUser = new user_model_1.UserModel(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
            const createdUser = yield newUser.save();
            server_response_1.ServerResponse.serverSuccess(res, 200, "Successfully Registered", {
                token: (0, token_1.createTokenFromEmailAndId)(createdUser.email, createdUser._id),
                data: createdUser,
            });
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 500, "Something Went Wrong", error);
        }
    }));
    app.post("/api/auth/sign-in", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userData } = req.body;
        const user = yield (0, auth_service_1.getUserByEmail)(userData.email);
        if (!user) {
            return server_response_1.ServerResponse.serverError(res, 400, "There is No User with Entered Email");
        }
        const verifiedPassword = yield (0, bcrypt_1.compare)(userData.password, user.password);
        if (!verifiedPassword)
            return server_response_1.ServerResponse.serverError(res, 401, "Invalid Password");
        return server_response_1.ServerResponse.serverSuccess(res, 200, "Successfully Signed In", {
            token: (0, token_1.createTokenFromEmailAndId)(user.email, user._id),
            user,
        });
    }));
    app.get("/api/auth/google", passport.authenticate("google", {
        scope: ["email", "profile"],
    }));
    // app.get(
    //   "/api/auth/google/callback",
    //   passport.authenticate("google", {
    //     failureRedirect: "/api/auth/google/failure",
    //     successRedirect: "http://localhost:4200/auth/login",
    //     session: true
    //   }),
    // );
    app.get("/api/auth/google/callback", (req, res, next) => {
        passport.authenticate("google", { failureRedirect: "/api/auth/google/failure", session: true }, (err, user, info) => {
            if (err || !user) {
                return res.redirect("/api/auth/google/failure");
            }
            // Manually establish session
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                console.log("✅ Logged in user:", req.user);
                console.log("✅ Session after login:", req.session);
                return res.redirect("http://localhost:4200/auth/login");
            });
        })(req, res, next);
    });
    app.get("/api/auth/google/failure", (_req, res) => {
        return server_response_1.ServerResponse.serverError(res, 401, "Failed to Authenticate");
    });
    app.get("/api/auth/logout", (req, res, next) => {
        req.logout((err) => {
            if (err)
                return next(err);
            res.redirect("http://localhost:4200/");
        });
    });
    app.get("/api/auth/google-login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.isAuthenticated() || !req.user) {
            return server_response_1.ServerResponse.serverError(res, 401, "Not Authenticated");
        }
        const existingUser = yield user_model_1.UserModel.findOne({
            email: req.user.email,
        });
        let userToSend = null;
        if (existingUser) {
            userToSend = existingUser;
        }
        else {
            const newUser = yield user_model_1.UserModel.create(Object.assign({}, req.user));
            userToSend = newUser;
        }
        return server_response_1.ServerResponse.serverSuccess(res, 200, "Login Successful", userToSend);
    }));
};
exports.default = authRoutes;
